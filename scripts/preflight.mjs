#!/usr/bin/env node
/**
 * Refuses to let a broken production config reach the domain.
 *
 * Run before every deploy (release.sh does it automatically):
 *   node scripts/preflight.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "./env.mjs";

const isProd = (process.env.NODE_ENV ?? "production") === "production";
loadEnv();
// .env.production wins for a real deploy
const prodEnv = path.join(process.cwd(), ".env.production");
if (fs.existsSync(prodEnv)) {
  for (const line of fs.readFileSync(prodEnv, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
}

const problems = [];
const warnings = [];

const secret = process.env.AUTH_SECRET ?? "";
if (secret.length < 24) problems.push("AUTH_SECRET is missing or under 24 chars — generate: openssl rand -base64 48");

const url = process.env.NEXT_PUBLIC_SITE_URL ?? "";
if (!url) problems.push("NEXT_PUBLIC_SITE_URL is not set — canonical URLs, sitemap and Open Graph need it");
else if (isProd && url.startsWith("http://")) problems.push(`NEXT_PUBLIC_SITE_URL is http:// (${url}) — use https:// in production`);
else if (isProd && /localhost|127\.0\.0\.1/.test(url)) problems.push(`NEXT_PUBLIC_SITE_URL still points at localhost (${url})`);

const driver = (process.env.DB_DRIVER ?? "sqlite").toLowerCase();
if (driver === "supabase") {
  if (!process.env.SUPABASE_URL) problems.push("DB_DRIVER=supabase but SUPABASE_URL is unset");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) problems.push("DB_DRIVER=supabase but SUPABASE_SERVICE_ROLE_KEY is unset");
} else {
  const file = process.env.SQLITE_PATH || "./data/imran.db";
  const dir = path.dirname(path.isAbsolute(file) ? file : path.join(process.cwd(), file));
  if (!fs.existsSync(dir)) warnings.push(`SQLite directory ${dir} does not exist yet — run: npm run db:init`);
  warnings.push("DB_DRIVER=sqlite: the host must keep a persistent disk. On serverless (Vercel) use DB_DRIVER=supabase.");
}

if (!process.env.RESEND_API_KEY) {
  warnings.push("RESEND_API_KEY is unset — submissions are still saved and shown in the admin panel, but no email notification is sent.");
}
if (!process.env.MAIL_TO) warnings.push("MAIL_TO is unset — notifications default to info@imranalasr.sa");

const nodeMajor = Number(process.versions.node.split(".")[0]);
const nodeMinor = Number(process.versions.node.split(".")[1]);
if (nodeMajor < 22 || (nodeMajor === 22 && nodeMinor < 5)) {
  problems.push(`Node ${process.versions.node} is too old — node:sqlite needs >= 22.5`);
}

for (const w of warnings) console.warn(`  ⚠  ${w}`);
if (problems.length) {
  console.error("\n✗ preflight failed:\n");
  for (const p of problems) console.error(`  ✗  ${p}`);
  console.error("");
  process.exit(1);
}
console.log(`✓ preflight passed — ${url} · db:${driver} · node ${process.versions.node}`);
