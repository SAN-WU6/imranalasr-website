import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { findAdmin } from "./db";

const COOKIE = "imran_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 24) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Generate one with: openssl rand -base64 48"
    );
  }
  return s;
}

/* ───────────────────────────── passwords ─────────────────────────────── */

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
  return `scrypt$16384$8$1$${salt}$${key}`;
}

export function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, N, r, p, salt, key] = parts;
  const derived = scryptSync(password, salt, 64, { N: Number(N), r: Number(r), p: Number(p) });
  const expected = Buffer.from(key, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

/* ─────────────────────────────── sessions ────────────────────────────── */

type SessionPayload = { sub: string; exp: number };

function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken(email: string) {
  const payload: SessionPayload = { sub: email, exp: Math.floor(Date.now() / 1000) + MAX_AGE };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function startSession(email: string) {
  const jar = await cookies();
  jar.set(COOKIE, createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function currentAdmin(): Promise<string | null> {
  const jar = await cookies();
  const session = readSessionToken(jar.get(COOKIE)?.value);
  return session?.sub ?? null;
}

export async function requireAdmin(): Promise<string> {
  const email = await currentAdmin();
  if (!email) throw new Error("UNAUTHORISED");
  return email;
}

export async function authenticate(email: string, password: string) {
  const user = await findAdmin(email);
  if (!user) {
    // Constant-ish work factor so a missing user is not distinguishable by timing.
    scryptSync(password, "decoy-salt-value", 64, { N: 16384, r: 8, p: 1 });
    return false;
  }
  return verifyPassword(password, user.password_hash);
}

export const SESSION_COOKIE = COOKIE;
