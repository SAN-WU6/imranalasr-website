import "server-only";
import { NextResponse } from "next/server";
import { consumeRateLimit, insertRow, type TableName } from "@/lib/db";
import { resolveNotificationEmail } from "@/lib/content";
import { clientFingerprint } from "@/lib/request-context";
import { renderNotification, sendMail } from "@/lib/mail";
import { normalisePhone, validate, type Schema } from "@/lib/validation";

/**
 * One submission pipeline for every public form:
 * spam gates → validate → persist → reference → notify.
 *
 * Notification failure never fails the request: the row is already saved and
 * visible in the admin panel, so a mail outage cannot lose a lead.
 */
export async function handleSubmission({
  request,
  table,
  schema,
  map,
  subject,
  rows,
}: {
  request: Request;
  table: TableName;
  schema: Schema;
  map: (data: Record<string, string>) => Record<string, unknown>;
  subject: string;
  rows: (data: Record<string, string>) => [string, string][];
}) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  /* ── Spam gates ─────────────────────────────────────────────────────
     1. honeypot field that only a bot fills in
     2. a form completed in under 2.5s was not typed by a person
     3. a fixed-window per-fingerprint quota                            */
  if (typeof payload.company_website === "string" && payload.company_website.trim() !== "") {
    return NextResponse.json({ ok: true, reference: "" });
  }
  const elapsed = Number(payload._elapsed ?? 0);
  if (elapsed > 0 && elapsed < 2500) {
    return NextResponse.json({ error: "too_fast" }, { status: 429 });
  }
  if (payload.consent !== "yes" && payload.consent !== true) {
    return NextResponse.json({ error: "validation", fields: { consent: "consent" } }, { status: 422 });
  }

  const fingerprint = clientFingerprint(request.headers);
  const max = Number(process.env.RATE_LIMIT_PER_HOUR ?? 6);
  const allowed = await consumeRateLimit(`${table}:${fingerprint}`, max);
  if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  /* ── Validation (authoritative) ─────────────────────────────────── */
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "string") data[k] = v.trim();
  }
  if (data.phone) data.phone = normalisePhone(data.phone);

  const errors = validate(data, schema);
  if (errors.length) {
    const fields: Record<string, string> = {};
    for (const e of errors) fields[e.field] = e.code;
    return NextResponse.json({ error: "validation", fields }, { status: 422 });
  }

  /* ── Persist ─────────────────────────────────────────────────────── */
  const row = await insertRow<{ ref: string }>(table, {
    ...map(data),
    locale: data.locale === "en" ? "en" : "ar",
    ip_hash: fingerprint,
  });

  /* ── Notify ──────────────────────────────────────────────────────── */
  const { html, text } = renderNotification(subject, row.ref, rows(data));
  // The recipient is read per submission so a change in the dashboard takes
  // effect immediately, without a redeploy.
  const { email: to } = await resolveNotificationEmail();
  void sendMail({ subject: `${subject} — ${row.ref}`, html, text, replyTo: data.email, to }).catch(() => undefined);

  return NextResponse.json({ ok: true, reference: row.ref });
}
