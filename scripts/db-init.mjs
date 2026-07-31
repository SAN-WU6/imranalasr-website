#!/usr/bin/env node
/**
 * Creates the SQLite database and every table. Safe to run repeatedly.
 * With DB_DRIVER=supabase it prints the Postgres migration to run instead.
 */
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { loadEnv } from "./env.mjs";

loadEnv();

if ((process.env.DB_DRIVER ?? "sqlite").toLowerCase() === "supabase") {
  console.log("DB_DRIVER=supabase — run supabase/schema.sql in the Supabase SQL editor.");
  console.log(path.join(process.cwd(), "supabase", "schema.sql"));
  process.exit(0);
}

const DDL = fs.readFileSync(path.join(process.cwd(), "src", "lib", "db", "schema.ts"), "utf8");
const match = DDL.match(/export const SQLITE_DDL = `([\s\S]*?)`;/);
if (!match) {
  console.error("Could not read SQLITE_DDL from src/lib/db/schema.ts");
  process.exit(1);
}

const file = process.env.SQLITE_PATH || "./data/imran.db";
const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
fs.mkdirSync(path.dirname(abs), { recursive: true });

const db = new DatabaseSync(abs);
db.exec(match[1]);

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
  .map((r) => r.name);

console.log(`Database ready: ${abs}`);
console.log(`Tables: ${tables.join(", ")}`);
db.close();
