import { Pool } from "pg";
import { hashEmail, encryptEmail, maskEmail } from "./crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export async function initDb() {
  // Create table (email column kept nullable for backward compat with old plain-text rows)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      email           TEXT        UNIQUE,       -- legacy plain-text (null for new rows)
      email_hash      TEXT        UNIQUE,       -- sha256 hash for lookups
      email_encrypted TEXT,                     -- AES-256-GCM encrypted for sending
      email_display   TEXT,                     -- masked e.g. sh***@gmail.com for UI
      topics          TEXT[]      NOT NULL DEFAULT '{}',
      schedule_time   TEXT        NOT NULL DEFAULT '08:00',
      timezone        TEXT        NOT NULL DEFAULT 'UTC',
      active          BOOLEAN     NOT NULL DEFAULT true,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Migrations — safe to run repeatedly
  await pool.query(`ALTER TABLE subscriptions ALTER COLUMN email DROP NOT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS email_hash TEXT`);
  await pool.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS email_encrypted TEXT`);
  await pool.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS email_display TEXT`);
  await pool.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC'`).catch(() => {});
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_email_hash_idx
    ON subscriptions (email_hash)
    WHERE email_hash IS NOT NULL
  `);

  if (!process.env.ENCRYPTION_KEY) {
    console.warn("> ⚠️  ENCRYPTION_KEY not set — email encryption disabled. Set it in Railway env vars.");
  }
}

export interface Subscription {
  id: string;
  email: string | null;         // legacy plain-text (null for new rows)
  email_hash: string | null;
  email_encrypted: string | null;
  email_display: string | null;
  topics: string[];
  schedule_time: string;
  timezone: string;
  active: boolean;
  created_at: string;
}

/** Look up by hash first, fall back to plain email for old rows */
export async function getSubscription(email: string): Promise<Subscription | null> {
  const hash = hashEmail(email);
  const result = await pool.query(
    "SELECT * FROM subscriptions WHERE email_hash = $1 OR email = $2 LIMIT 1",
    [hash, email.toLowerCase().trim()]
  );
  return result.rows[0] ?? null;
}

export async function createSubscription(
  email: string,
  topics: string[],
  scheduleTime: string,
  timezone: string
): Promise<Subscription> {
  const hash = hashEmail(email);
  const encrypted = process.env.ENCRYPTION_KEY ? encryptEmail(email) : null;
  const display = maskEmail(email);

  const result = await pool.query(
    `INSERT INTO subscriptions (email_hash, email_encrypted, email_display, topics, schedule_time, timezone)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [hash, encrypted, display, topics, scheduleTime, timezone]
  );
  return result.rows[0];
}

export async function updateSubscription(
  email: string,
  topics: string[],
  scheduleTime: string,
  timezone: string
): Promise<Subscription | null> {
  const hash = hashEmail(email);
  const encrypted = process.env.ENCRYPTION_KEY ? encryptEmail(email) : null;
  const display = maskEmail(email);

  const result = await pool.query(
    `UPDATE subscriptions
     SET email_hash = $2, email_encrypted = $3, email_display = $4,
         email = NULL, topics = $5, schedule_time = $6, timezone = $7,
         active = true, updated_at = NOW()
     WHERE email_hash = $1 OR email = $8
     RETURNING *`,
    [hash, hash, encrypted, display, topics, scheduleTime, timezone, email.toLowerCase().trim()]
  );
  return result.rows[0] ?? null;
}

export async function cancelSubscription(email: string): Promise<boolean> {
  const hash = hashEmail(email);
  const result = await pool.query(
    "UPDATE subscriptions SET active = false, updated_at = NOW() WHERE email_hash = $1 OR email = $2",
    [hash, email.toLowerCase().trim()]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getActiveSubscriptions(): Promise<Subscription[]> {
  const result = await pool.query(
    "SELECT * FROM subscriptions WHERE active = true AND array_length(topics, 1) > 0"
  );
  return result.rows;
}
