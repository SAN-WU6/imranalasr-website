import "server-only";
import { createHash } from "node:crypto";

/**
 * A short, salted, one-way hash of the client IP. It is enough to rate-limit
 * and to spot abuse, and it is not reversible into an address — which keeps
 * the privacy policy honest.
 */
export function clientFingerprint(headers: Headers) {
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  const salt = process.env.AUTH_SECRET ?? "imran-local-salt";
  return createHash("sha256").update(`${ip}|${salt}`).digest("hex").slice(0, 24);
}
