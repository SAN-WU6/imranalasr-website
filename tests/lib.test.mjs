/**
 * Unit tests for the pure logic that the forms and the admin depend on:
 * validation, phone normalisation, password hashing, session signing and
 * reference-number shape. No build step, no test framework beyond node:test.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/* ── mirrors src/lib/validation.ts ─────────────────────────────────── */
const SAUDI_MOBILE = /^(?:\+?966|00966|0)?5\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function normalisePhone(raw) {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+966")) return digits;
  if (digits.startsWith("00966")) return `+${digits.slice(2)}`;
  if (digits.startsWith("966")) return `+${digits}`;
  if (digits.startsWith("0")) return `+966${digits.slice(1)}`;
  if (/^5\d{8}$/.test(digits)) return `+966${digits}`;
  return digits;
}

function validateField(value, rule) {
  const s = typeof value === "string" ? value.trim() : value == null ? "" : String(value);
  if (rule.required && !s) return "required";
  if (!s) return null;
  if (rule.min && s.length < rule.min) return "tooShort";
  if (rule.max && s.length > rule.max) return "tooLong";
  if (rule.type === "email" && !EMAIL.test(s)) return "email";
  if (rule.type === "phone" && !SAUDI_MOBILE.test(s.replace(/[\s-]/g, ""))) return "phone";
  if (rule.oneOf && !rule.oneOf.includes(s)) return "required";
  return null;
}

test("Saudi mobile numbers normalise to E.164", () => {
  for (const input of ["0556630202", "556630202", "+966556630202", "00966556630202", "966556630202", "055 663 0202"]) {
    assert.equal(normalisePhone(input), "+966556630202", `failed for ${input}`);
  }
});

test("phone validation accepts real formats and rejects junk", () => {
  const rule = { required: true, type: "phone" };
  for (const ok of ["0556630202", "+966552469717", "00966501234567"]) {
    assert.equal(validateField(ok, rule), null, `${ok} should pass`);
  }
  for (const bad of ["12345", "0456630202", "05566302", "abcdefghij", ""]) {
    assert.notEqual(validateField(bad, rule), null, `${bad} should fail`);
  }
});

test("email validation", () => {
  const rule = { required: true, type: "email" };
  assert.equal(validateField("requests@imranalasr.sa", rule), null);
  assert.equal(validateField("a.b+c@sub.domain.com", rule), null);
  assert.equal(validateField("no-at-sign", rule), "email");
  assert.equal(validateField("missing@tld", rule), "email");
  assert.equal(validateField("   ", rule), "required");
});

test("length rules", () => {
  assert.equal(validateField("ab", { min: 3 }), "tooShort");
  assert.equal(validateField("abcd", { min: 3 }), null);
  assert.equal(validateField("abcd", { max: 3 }), "tooLong");
});

test("oneOf rejects values outside the allowed set", () => {
  const rule = { oneOf: ["phone", "whatsapp", "email"] };
  assert.equal(validateField("whatsapp", rule), null);
  assert.equal(validateField("carrier-pigeon", rule), "required");
});

/* ── mirrors src/lib/auth.ts ───────────────────────────────────────── */
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
  return `scrypt$16384$8$1$${salt}$${key}`;
}
function verifyPassword(password, stored) {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, N, r, p, salt, key] = parts;
  const derived = scryptSync(password, salt, 64, { N: Number(N), r: Number(r), p: Number(p) });
  const expected = Buffer.from(key, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

test("password hashing round-trips and rejects wrong passwords", () => {
  const stored = hashPassword("a-very-long-admin-password");
  assert.ok(verifyPassword("a-very-long-admin-password", stored));
  assert.ok(!verifyPassword("a-very-long-admin-passworD", stored));
  assert.ok(!verifyPassword("", stored));
  assert.ok(!verifyPassword("x", "not-a-hash"));
});

test("two hashes of the same password differ (salted)", () => {
  assert.notEqual(hashPassword("same-password-here"), hashPassword("same-password-here"));
});

/* ── session token ─────────────────────────────────────────────────── */
const SECRET = "test-secret-that-is-long-enough-for-hmac";
const sign = (data) => createHmac("sha256", SECRET).update(data).digest("base64url");

function createSessionToken(email, ttl = 3600) {
  const body = Buffer.from(JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + ttl })).toString("base64url");
  return `${body}.${sign(body)}`;
}
function readSessionToken(token) {
  const [body, sig] = String(token).split(".");
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (payload.exp * 1000 < Date.now()) return null;
  return payload;
}

test("session tokens verify, and tampering or expiry invalidates them", () => {
  const token = createSessionToken("admin@imranalasr.sa");
  assert.equal(readSessionToken(token).sub, "admin@imranalasr.sa");

  const [body] = token.split(".");
  assert.equal(readSessionToken(`${body}.deadbeef`), null, "forged signature must fail");

  const forgedBody = Buffer.from(JSON.stringify({ sub: "attacker@example.com", exp: 9e9 })).toString("base64url");
  assert.equal(readSessionToken(`${forgedBody}.${sign(body)}`), null, "swapped payload must fail");

  assert.equal(readSessionToken(createSessionToken("admin@imranalasr.sa", -10)), null, "expired must fail");
  assert.equal(readSessionToken(undefined), null);
});

/* ── reference numbers ─────────────────────────────────────────────── */
function makeReference(prefix) {
  const d = new Date();
  const yy = String(d.getUTCFullYear()).slice(2);
  const doy = String(Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86_400_000)).padStart(3, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const tail = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `${prefix}-${yy}${doy}-${tail}`;
}

test("reference numbers are readable, unambiguous and unique", () => {
  const seen = new Set();
  for (let i = 0; i < 400; i++) {
    const ref = makeReference("RFQ");
    assert.match(ref, /^RFQ-\d{5}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);
    assert.ok(!/[IO01]/.test(ref.split("-")[2]), "tail must avoid look-alike characters");
    seen.add(ref);
  }
  assert.ok(seen.size > 395, "references should not collide in normal use");
});

/* ── CSV export ────────────────────────────────────────────────────── */
function toCsv(rows) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const cell = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))].join("\r\n");
}

test("CSV escapes quotes, commas, newlines and nulls", () => {
  const csv = toCsv([{ ref: "RFQ-1", note: 'he said "go", then left\nnext line', empty: null }]);
  const [header, row] = csv.split("\r\n");
  assert.equal(header, "ref,note,empty");
  assert.equal(row, 'RFQ-1,"he said ""go"", then left\nnext line",');
});
