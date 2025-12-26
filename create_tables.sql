-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL UNIQUE,
  profile_photo TEXT,
  nickname_color VARCHAR(7) DEFAULT '#00ffff',
  mood VARCHAR(10) DEFAULT '😊',
  tv_style VARCHAR(20) DEFAULT '1990s',
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  cover_url TEXT,
  file_key TEXT NOT NULL,
  mime_type VARCHAR(100),
  size INTEGER,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  last_heartbeat TIMESTAMP DEFAULT NOW()
);

-- Playback state table
CREATE TABLE IF NOT EXISTS playback_state (
  id SERIAL PRIMARY KEY,
  current_track_id INTEGER,
  "current_time" INTEGER DEFAULT 0,
  is_playing BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Active instruments table
CREATE TABLE IF NOT EXISTS active_instruments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  instrument VARCHAR(20) NOT NULL,
  is_playing BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMP DEFAULT NOW()
);

-- Jam notes table
CREATE TABLE IF NOT EXISTS jam_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  instrument VARCHAR(20) NOT NULL,
  note VARCHAR(10) NOT NULL,
  velocity INTEGER DEFAULT 100,
  timestamp TIMESTAMP DEFAULT NOW()
);
