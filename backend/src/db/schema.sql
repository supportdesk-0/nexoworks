-- ═══════════════════════════════════════════════════════════
--  NEXOWORK — PostgreSQL Schema
--  Run: psql $POSTGRES_URL -f schema.sql
-- ═══════════════════════════════════════════════════════════

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  NOT NULL DEFAULT 'employee',
  dept        VARCHAR(100),
  avatar      VARCHAR(10),
  color       VARCHAR(10)  DEFAULT '#2563EB',
  online      BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Channels
CREATE TABLE IF NOT EXISTS channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(80)  UNIQUE NOT NULL,
  icon        VARCHAR(10)  DEFAULT '#',
  dept        VARCHAR(100),
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id  UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  text        TEXT NOT NULL,
  reactions   JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id, created_at DESC);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(200) NOT NULL,
  content     TEXT NOT NULL,
  author_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  important   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Files
CREATE TABLE IF NOT EXISTS files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  url         TEXT NOT NULL,
  size_bytes  BIGINT,
  mime_type   VARCHAR(100),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings
CREATE TABLE IF NOT EXISTS meetings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          VARCHAR(200) NOT NULL,
  scheduled_at   TIMESTAMPTZ  NOT NULL,
  created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  participant_ids UUID[],
  room_id        VARCHAR(100),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default channels
INSERT INTO channels (name, icon, dept) VALUES
  ('general',    '#',  NULL),
  ('tecnología', '#',  'Tecnología'),
  ('marketing',  '#',  'Marketing'),
  ('diseño',     '#',  'Diseño'),
  ('anuncios',   '📢', NULL)
ON CONFLICT (name) DO NOTHING;
