-- PostFlow schema. Apply with: npx wrangler d1 migrations apply postflow --local (or --remote)

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT,
  industry TEXT,
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE content_pillars (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  topic TEXT NOT NULL
);
CREATE INDEX content_pillars_user_idx ON content_pillars (user_id);

CREATE TABLE voice_samples (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  sample_text TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX voice_samples_user_idx ON voice_samples (user_id);

CREATE TABLE voice_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  traits_json TEXT NOT NULL,
  samples_hash TEXT NOT NULL,
  analyzed_at TEXT NOT NULL
);

CREATE TABLE inspirations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX inspirations_user_idx ON inspirations (user_id);

CREATE TABLE inspiration_samples (
  id TEXT PRIMARY KEY,
  inspiration_id TEXT NOT NULL REFERENCES inspirations (id) ON DELETE CASCADE,
  sample_text TEXT NOT NULL
);
CREATE INDEX inspiration_samples_insp_idx ON inspiration_samples (inspiration_id);

CREATE TABLE drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  one_liner TEXT NOT NULL,
  style_mode TEXT NOT NULL,
  post_text TEXT NOT NULL,
  hook_line TEXT NOT NULL,
  hashtags_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'copied', 'discarded')),
  created_at TEXT NOT NULL
);
CREATE INDEX drafts_user_created_idx ON drafts (user_id, created_at);
