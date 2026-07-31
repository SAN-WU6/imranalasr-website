import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { SQLITE_DDL } from "./schema";

/**
 * `node:sqlite` is resolved on first use, not at import time.
 *
 * A static `import … from "node:sqlite"` would be evaluated whenever this
 * module is loaded — including under `DB_DRIVER=supabase`, where SQLite is
 * never touched. On a host running Node below 22.5 that throws
 * ERR_UNKNOWN_BUILTIN_MODULE and takes the whole server down at boot, so the
 * Supabase escape hatch would be unusable precisely on the hosts that need it.
 * Deferring the resolve keeps the app bootable anywhere and fails only if
 * SQLite is actually asked for.
 */
type SqliteDb = {
  exec(sql: string): void;
  prepare(sql: string): {
    all(...params: never[]): unknown[];
    get(...params: never[]): unknown;
    run(...params: never[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  };
};

let db: SqliteDb | null = null;

function loadDatabaseSync(): new (filename: string) => SqliteDb {
  try {
    return createRequire(import.meta.url)("node:sqlite").DatabaseSync;
  } catch {
    throw new Error(
      `DB_DRIVER=sqlite needs Node >= 22.5 for the built-in node:sqlite module; this host runs Node ${process.versions.node}. ` +
        `Either upgrade Node or set DB_DRIVER=supabase with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`
    );
  }
}

export function getDb(): SqliteDb {
  if (db) return db;
  const DatabaseSync = loadDatabaseSync();
  const file = process.env.SQLITE_PATH || "./data/imran.db";
  const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const instance = new DatabaseSync(abs);
  instance.exec(SQLITE_DDL);
  db = instance;
  return instance;
}

type Row = Record<string, unknown>;

export function all<T = Row>(sql: string, params: unknown[] = []): T[] {
  return getDb()
    .prepare(sql)
    .all(...(params as never[])) as T[];
}

export function get<T = Row>(sql: string, params: unknown[] = []): T | undefined {
  return getDb()
    .prepare(sql)
    .get(...(params as never[])) as T | undefined;
}

export function run(sql: string, params: unknown[] = []) {
  return getDb()
    .prepare(sql)
    .run(...(params as never[]));
}
