#!/usr/bin/env node
/**
 * Creates (or resets the password of) an admin account.
 *
 *   npm run admin:create -- admin@imranalasr.sa 'a-long-password'
 *
 * The password is never stored: only a scrypt hash goes into the database.
 * Re-running with the same email replaces the hash, which is how you reset a
 * forgotten password.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { randomBytes, scryptSync } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { loadEnv } from "./env.mjs";

loadEnv();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
  return `scrypt$16384$8$1$${salt}$${key}`;
}

const [, , argEmail, argPassword] = process.argv;
let email = argEmail;
let password = argPassword;

if (!email || !password) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  email = email || (await rl.question("Admin email: "));
  password = password || (await rl.question("Password (min 12 chars): "));
  rl.close();
}

email = String(email).trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
  console.error("Invalid email.");
  process.exit(1);
}
if (String(password).length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

const hash = hashPassword(password);
const driver = (process.env.DB_DRIVER ?? "sqlite").toLowerCase();

if (driver === "supabase") {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
    process.exit(1);
  }
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/admin_users?on_conflict=email`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ email, password_hash: hash, created_at: new Date().toISOString() }),
  });
  if (!res.ok) {
    console.error(`Supabase ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  console.log(`Admin ready (Supabase): ${email}`);
} else {
  const file = process.env.SQLITE_PATH || "./data/imran.db";
  const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const db = new DatabaseSync(abs);
  db.exec(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL)`);
  db.prepare(
    `INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash`
  ).run(email, hash, new Date().toISOString());
  db.close();
  console.log(`Admin ready (SQLite ${abs}): ${email}`);
}

if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 24) {
  console.warn("\n⚠  AUTH_SECRET is missing or too short in .env.local — sign-in will fail.");
  console.warn("   Generate one with:  openssl rand -base64 48");
}
