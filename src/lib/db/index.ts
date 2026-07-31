import "server-only";
import type { ContactMessage, ProfileRequest, QuoteRequest, TableName } from "./schema";
import * as sqlite from "./sqlite";
import { sbInsert, sbSelect, sbUpdate, sbUpsert } from "./supabase";

export const driver = (process.env.DB_DRIVER ?? "sqlite").toLowerCase() === "supabase" ? "supabase" : "sqlite";

const nowIso = () => new Date().toISOString();

/* ────────────────────────────── references ───────────────────────────── */

const PREFIX: Record<TableName, string> = {
  quote_requests: "RFQ",
  profile_requests: "CPR",
  contact_messages: "MSG",
};

/** e.g. RFQ-26073-4KQ2 — sortable by date, short enough to read over the phone. */
export function makeReference(table: TableName) {
  const d = new Date();
  const yy = String(d.getUTCFullYear()).slice(2);
  const doy = String(
    Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86_400_000)
  ).padStart(3, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const tail = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `${PREFIX[table]}-${yy}${doy}-${tail}`;
}

/* ────────────────────────────── inserts ──────────────────────────────── */

type AnyRow = Record<string, unknown>;

export async function insertRow<T>(table: TableName, row: AnyRow): Promise<T> {
  const full: AnyRow = { ...row, ref: row.ref ?? makeReference(table), created_at: nowIso() };
  if (driver === "supabase") return (await sbInsert<T>(table, full)) as T;

  const keys = Object.keys(full);
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`;
  sqlite.run(sql, keys.map((k) => (full[k] === undefined ? null : full[k])));
  return sqlite.get<T>(`SELECT * FROM ${table} WHERE ref = ?`, [full.ref])!;
}

/* ────────────────────────────── queries ──────────────────────────────── */

export type ListOptions = { q?: string; status?: string; limit?: number; offset?: number };

const SEARCH_COLUMNS: Record<TableName, string[]> = {
  quote_requests: ["ref", "name", "company", "email", "phone", "project_location", "scope_of_work", "description"],
  profile_requests: ["ref", "name", "company", "email", "phone", "reason", "related_opportunity"],
  contact_messages: ["ref", "name", "company", "email", "phone", "subject", "message"],
};

export async function listRows<T>(table: TableName, opts: ListOptions = {}): Promise<T[]> {
  const limit = Math.min(opts.limit ?? 200, 1000);
  const offset = opts.offset ?? 0;

  if (driver === "supabase") {
    const parts = ["select=*", "order=created_at.desc", `limit=${limit}`, `offset=${offset}`];
    if (opts.status && opts.status !== "all") parts.push(`status=eq.${encodeURIComponent(opts.status)}`);
    if (opts.q) {
      const term = `*${opts.q.replace(/[*(),]/g, "")}*`;
      const or = SEARCH_COLUMNS[table].map((c) => `${c}.ilike.${term}`).join(",");
      parts.push(`or=(${or})`);
    }
    return sbSelect<T>(table, parts.join("&"));
  }

  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.status && opts.status !== "all") {
    where.push("status = ?");
    params.push(opts.status);
  }
  if (opts.q) {
    where.push(`(${SEARCH_COLUMNS[table].map((c) => `${c} LIKE ?`).join(" OR ")})`);
    for (let i = 0; i < SEARCH_COLUMNS[table].length; i++) params.push(`%${opts.q}%`);
  }
  const sql =
    `SELECT * FROM ${table}` +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  return sqlite.all<T>(sql, [...params, limit, offset]);
}

export async function getRowByRef<T>(table: TableName, ref: string): Promise<T | undefined> {
  if (driver === "supabase") {
    const rows = await sbSelect<T>(table, `select=*&ref=eq.${encodeURIComponent(ref)}&limit=1`);
    return rows[0];
  }
  return sqlite.get<T>(`SELECT * FROM ${table} WHERE ref = ?`, [ref]);
}

export async function updateRow(table: TableName, ref: string, patch: AnyRow) {
  if (driver === "supabase") {
    await sbUpdate(table, `ref=eq.${encodeURIComponent(ref)}`, patch);
    return;
  }
  const keys = Object.keys(patch);
  if (!keys.length) return;
  sqlite.run(
    `UPDATE ${table} SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE ref = ?`,
    [...keys.map((k) => patch[k]), ref]
  );
}

export async function countByStatus(table: TableName): Promise<Record<string, number>> {
  if (driver === "supabase") {
    const rows = await sbSelect<{ status: string }>(table, "select=status&limit=5000");
    return rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});
  }
  const rows = sqlite.all<{ status: string; n: number }>(
    `SELECT status, COUNT(*) as n FROM ${table} GROUP BY status`
  );
  return rows.reduce<Record<string, number>>((acc, r) => ((acc[r.status] = r.n), acc), {});
}

/* ─────────────────────────── content overrides ───────────────────────── */

export async function getOverride<T>(key: string): Promise<T | null> {
  if (driver === "supabase") {
    const rows = await sbSelect<{ value: unknown }>(
      "content_overrides",
      `select=value&key=eq.${encodeURIComponent(key)}&limit=1`
    );
    if (!rows[0]) return null;
    const v = rows[0].value;
    return (typeof v === "string" ? JSON.parse(v) : v) as T;
  }
  const row = sqlite.get<{ value: string }>("SELECT value FROM content_overrides WHERE key = ?", [key]);
  return row ? (JSON.parse(row.value) as T) : null;
}

export async function getOverridesByPrefix<T>(prefix: string): Promise<Record<string, T>> {
  let rows: { key: string; value: unknown }[];
  if (driver === "supabase") {
    rows = await sbSelect<{ key: string; value: unknown }>(
      "content_overrides",
      `select=key,value&key=like.${encodeURIComponent(prefix + "*")}&limit=1000`
    );
  } else {
    rows = sqlite.all<{ key: string; value: string }>(
      "SELECT key, value FROM content_overrides WHERE key LIKE ?",
      [`${prefix}%`]
    );
  }
  const out: Record<string, T> = {};
  for (const r of rows) {
    const v = r.value;
    out[r.key] = (typeof v === "string" ? JSON.parse(v) : v) as T;
  }
  return out;
}

export async function setOverride(key: string, value: unknown) {
  const updated_at = nowIso();
  if (driver === "supabase") {
    await sbUpsert("content_overrides", { key, value, updated_at }, "key");
    return;
  }
  sqlite.run(
    `INSERT INTO content_overrides (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, JSON.stringify(value), updated_at]
  );
}

export async function clearOverride(key: string) {
  if (driver === "supabase") {
    await sbUpdate("content_overrides", `key=eq.${encodeURIComponent(key)}`, { value: "{}" });
    return;
  }
  sqlite.run("DELETE FROM content_overrides WHERE key = ?", [key]);
}

/* ───────────────────────────── admin users ───────────────────────────── */

export type AdminUser = { id: number; email: string; password_hash: string; created_at: string };

export async function findAdmin(email: string): Promise<AdminUser | undefined> {
  const normalised = email.trim().toLowerCase();
  if (driver === "supabase") {
    const rows = await sbSelect<AdminUser>(
      "admin_users",
      `select=*&email=eq.${encodeURIComponent(normalised)}&limit=1`
    );
    return rows[0];
  }
  return sqlite.get<AdminUser>("SELECT * FROM admin_users WHERE email = ?", [normalised]);
}

export async function upsertAdmin(email: string, passwordHash: string) {
  const normalised = email.trim().toLowerCase();
  if (driver === "supabase") {
    await sbUpsert(
      "admin_users",
      { email: normalised, password_hash: passwordHash, created_at: nowIso() },
      "email"
    );
    return;
  }
  sqlite.run(
    `INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash`,
    [normalised, passwordHash, nowIso()]
  );
}

export async function adminCount(): Promise<number> {
  if (driver === "supabase") {
    const rows = await sbSelect<{ id: number }>("admin_users", "select=id&limit=100");
    return rows.length;
  }
  return sqlite.get<{ n: number }>("SELECT COUNT(*) as n FROM admin_users")?.n ?? 0;
}

/* ───────────────────────────── rate limiting ─────────────────────────── */

/** Fixed-window counter. Returns true when the caller is still within budget. */
export async function consumeRateLimit(bucket: string, max: number, windowMs = 3_600_000): Promise<boolean> {
  const now = Date.now();
  if (driver === "supabase") {
    const rows = await sbSelect<{ window_start: string; hits: number }>(
      "rate_limits",
      `select=window_start,hits&bucket=eq.${encodeURIComponent(bucket)}&limit=1`
    );
    const row = rows[0];
    if (!row || now - Date.parse(row.window_start) > windowMs) {
      await sbUpsert("rate_limits", { bucket, window_start: new Date(now).toISOString(), hits: 1 }, "bucket");
      return true;
    }
    if (row.hits >= max) return false;
    await sbUpdate("rate_limits", `bucket=eq.${encodeURIComponent(bucket)}`, { hits: row.hits + 1 });
    return true;
  }

  const row = sqlite.get<{ window_start: string; hits: number }>(
    "SELECT window_start, hits FROM rate_limits WHERE bucket = ?",
    [bucket]
  );
  if (!row || now - Date.parse(row.window_start) > windowMs) {
    sqlite.run(
      `INSERT INTO rate_limits (bucket, window_start, hits) VALUES (?, ?, 1)
       ON CONFLICT(bucket) DO UPDATE SET window_start = excluded.window_start, hits = 1`,
      [bucket, new Date(now).toISOString()]
    );
    return true;
  }
  if (row.hits >= max) return false;
  sqlite.run("UPDATE rate_limits SET hits = hits + 1 WHERE bucket = ?", [bucket]);
  return true;
}

/* ─────────────────────────────── audit log ───────────────────────────── */

export async function audit(actor: string, action: string, target: string) {
  const row = { created_at: nowIso(), actor, action, target };
  if (driver === "supabase") {
    await sbInsert("audit_log", row);
    return;
  }
  sqlite.run("INSERT INTO audit_log (created_at, actor, action, target) VALUES (?, ?, ?, ?)", [
    row.created_at,
    actor,
    action,
    target,
  ]);
}

export type { QuoteRequest, ProfileRequest, ContactMessage, TableName };
