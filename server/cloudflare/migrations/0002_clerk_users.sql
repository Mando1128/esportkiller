-- Preserve the legacy users/sessions tables until production data is audited.
-- New production identities are keyed by Clerk's immutable user ID.
CREATE TABLE IF NOT EXISTS clerk_users (
  clerk_user_id TEXT PRIMARY KEY,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'FREE',
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clerk_users_email
ON clerk_users(email);
