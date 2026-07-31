/**
 * One schema, two dialects.
 *
 * `SQLITE_DDL` is executed automatically on first use of the SQLite driver.
 * `supabase/schema.sql` (in the repo root of this app) is the Postgres
 * equivalent, including row-level security. Keep both in step.
 */

export const SQLITE_DDL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS quote_requests (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  ref               TEXT NOT NULL UNIQUE,
  created_at        TEXT NOT NULL,
  name              TEXT NOT NULL,
  company           TEXT NOT NULL,
  job_title         TEXT,
  phone             TEXT NOT NULL,
  email             TEXT NOT NULL,
  project_type      TEXT NOT NULL,
  project_location  TEXT NOT NULL,
  scope_of_work     TEXT NOT NULL,
  description       TEXT NOT NULL,
  start_window      TEXT,
  duration          TEXT,
  preferred_contact TEXT NOT NULL,
  locale            TEXT NOT NULL DEFAULT 'ar',
  status            TEXT NOT NULL DEFAULT 'new',
  notes             TEXT NOT NULL DEFAULT '',
  ip_hash           TEXT,
  user_agent        TEXT
);
CREATE INDEX IF NOT EXISTS idx_quote_created ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_status  ON quote_requests(status);

CREATE TABLE IF NOT EXISTS profile_requests (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  ref                  TEXT NOT NULL UNIQUE,
  created_at           TEXT NOT NULL,
  name                 TEXT NOT NULL,
  company              TEXT NOT NULL,
  job_title            TEXT,
  email                TEXT NOT NULL,
  phone                TEXT NOT NULL,
  reason               TEXT NOT NULL,
  related_opportunity  TEXT,
  locale               TEXT NOT NULL DEFAULT 'ar',
  status               TEXT NOT NULL DEFAULT 'new',
  notes                TEXT NOT NULL DEFAULT '',
  ip_hash              TEXT
);
CREATE INDEX IF NOT EXISTS idx_profile_created ON profile_requests(created_at DESC);

CREATE TABLE IF NOT EXISTS contact_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ref         TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL,
  name        TEXT NOT NULL,
  company     TEXT,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  locale      TEXT NOT NULL DEFAULT 'ar',
  status      TEXT NOT NULL DEFAULT 'new',
  notes       TEXT NOT NULL DEFAULT '',
  ip_hash     TEXT
);
CREATE INDEX IF NOT EXISTS idx_message_created ON contact_messages(created_at DESC);

CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_overrides (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket       TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  hits         INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  actor      TEXT NOT NULL,
  action     TEXT NOT NULL,
  target     TEXT NOT NULL
);
`;

export type RequestStatus = "new" | "in_review" | "contacted" | "quoted" | "won" | "closed" | "approved" | "rejected";

export const QUOTE_STATUSES: RequestStatus[] = ["new", "in_review", "contacted", "quoted", "won", "closed"];
export const PROFILE_STATUSES: RequestStatus[] = ["new", "in_review", "approved", "rejected", "closed"];
export const MESSAGE_STATUSES: RequestStatus[] = ["new", "in_review", "contacted", "closed"];

export type QuoteRequest = {
  id: number;
  ref: string;
  created_at: string;
  name: string;
  company: string;
  job_title: string | null;
  phone: string;
  email: string;
  project_type: string;
  project_location: string;
  scope_of_work: string;
  description: string;
  start_window: string | null;
  duration: string | null;
  preferred_contact: string;
  locale: string;
  status: string;
  notes: string;
  ip_hash: string | null;
  user_agent: string | null;
};

export type ProfileRequest = {
  id: number;
  ref: string;
  created_at: string;
  name: string;
  company: string;
  job_title: string | null;
  email: string;
  phone: string;
  reason: string;
  related_opportunity: string | null;
  locale: string;
  status: string;
  notes: string;
  ip_hash: string | null;
};

export type ContactMessage = {
  id: number;
  ref: string;
  created_at: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  locale: string;
  status: string;
  notes: string;
  ip_hash: string | null;
};

export type TableName = "quote_requests" | "profile_requests" | "contact_messages";
