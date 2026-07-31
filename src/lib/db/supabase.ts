import "server-only";

/**
 * Minimal PostgREST client for Supabase — deliberately dependency-free.
 * Only the service-role key is used, and only on the server.
 */

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("DB_DRIVER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return { url: url.replace(/\/$/, ""), key };
}

async function rest(pathAndQuery: string, init: RequestInit = {}) {
  const { url, key } = config();
  const res = await fetch(`${url}/rest/v1/${pathAndQuery}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase ${res.status}: ${body.slice(0, 400)}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function sbSelect<T>(table: string, query = ""): Promise<T[]> {
  return ((await rest(`${table}?${query}`)) ?? []) as T[];
}

export async function sbInsert<T>(table: string, row: Record<string, unknown>): Promise<T> {
  const data = (await rest(table, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row),
  })) as T[];
  return data[0];
}

export async function sbUpdate(table: string, query: string, patch: Record<string, unknown>) {
  await rest(`${table}?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
}

export async function sbUpsert(table: string, row: Record<string, unknown>, onConflict: string) {
  await rest(`${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
}

export async function sbUpsertMany(table: string, rows: Record<string, unknown>[], onConflict: string) {
  if (!rows.length) return;
  await rest(`${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
}

export async function sbDelete(table: string, query: string) {
  await rest(`${table}?${query}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

export async function storageUpload(path: string, body: Uint8Array, contentType: string) {
  const { url, key } = config();
  const res = await fetch(`${url}/storage/v1/object/project-images/${path}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer,
  });
  if (!res.ok) throw new Error(`Supabase storage ${res.status}: ${(await res.text()).slice(0, 400)}`);
  return `${url}/storage/v1/object/public/project-images/${path}`;
}

export async function storageDelete(paths: string[]) {
  if (!paths.length) return;
  const { url, key } = config();
  const res = await fetch(`${url}/storage/v1/object/project-images`, {
    method: "DELETE",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!res.ok) throw new Error(`Supabase storage ${res.status}: ${(await res.text()).slice(0, 400)}`);
}
