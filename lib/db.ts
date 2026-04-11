import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      email       TEXT        UNIQUE NOT NULL,
      topics      TEXT[]      NOT NULL DEFAULT '{}',
      schedule_time TEXT      NOT NULL DEFAULT '08:00',
      active      BOOLEAN     NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export interface Subscription {
  id: string;
  email: string;
  topics: string[];
  schedule_time: string;
  active: boolean;
  created_at: string;
}

export async function getSubscription(email: string): Promise<Subscription | null> {
  const result = await pool.query(
    "SELECT * FROM subscriptions WHERE email = $1",
    [email.toLowerCase().trim()]
  );
  return result.rows[0] ?? null;
}

export async function createSubscription(
  email: string,
  topics: string[],
  scheduleTime: string
): Promise<Subscription> {
  const result = await pool.query(
    `INSERT INTO subscriptions (email, topics, schedule_time)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email.toLowerCase().trim(), topics, scheduleTime]
  );
  return result.rows[0];
}

export async function updateSubscription(
  email: string,
  topics: string[],
  scheduleTime: string
): Promise<Subscription | null> {
  const result = await pool.query(
    `UPDATE subscriptions
     SET topics = $2, schedule_time = $3, active = true, updated_at = NOW()
     WHERE email = $1
     RETURNING *`,
    [email.toLowerCase().trim(), topics, scheduleTime]
  );
  return result.rows[0] ?? null;
}

export async function cancelSubscription(email: string): Promise<boolean> {
  const result = await pool.query(
    "UPDATE subscriptions SET active = false, updated_at = NOW() WHERE email = $1",
    [email.toLowerCase().trim()]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getActiveSubscriptions(): Promise<Subscription[]> {
  const result = await pool.query(
    "SELECT * FROM subscriptions WHERE active = true AND array_length(topics, 1) > 0"
  );
  return result.rows;
}
