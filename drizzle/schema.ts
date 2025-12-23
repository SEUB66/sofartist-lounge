import { mysqlTable, varchar, text, timestamp, int, boolean } from 'drizzle-orm/mysql-core';

// Table des utilisateurs
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  nickname: varchar('nickname', { length: 50 }).notNull().unique(),
  profilePhoto: text('profile_photo'), // URL de la photo de profil
  nicknameColor: varchar('nickname_color', { length: 7 }).default('#00ffff'), // Couleur hex
  mood: varchar('mood', { length: 10 }).default('😊'), // Emoji mood
  createdAt: timestamp('created_at').defaultNow(),
  lastSeenAt: timestamp('last_seen_at').defaultNow(),
});

// Table des messages de chat
export const messages = mysqlTable('messages', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Table des médias uploadés (musique + images)
export const media = mysqlTable('media', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  type: varchar('type', { length: 10 }).notNull(), // 'music' ou 'image'
  title: varchar('title', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(), // URL S3
  coverUrl: text('cover_url'), // URL de la cover (pour musique)
  fileKey: text('file_key').notNull(), // Clé S3 pour suppression
  mimeType: varchar('mime_type', { length: 100 }),
  size: int('size'), // Taille en bytes
  createdAt: timestamp('created_at').defaultNow(),
});

// Table des sessions (pour tracking utilisateurs en ligne)
export const sessions = mysqlTable('sessions', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().unique(),
  lastHeartbeat: timestamp('last_heartbeat').defaultNow(),
});

// Table de l'etat de lecture (synchronisation RetroTV)
export const playbackState = mysqlTable('playback_state', {
  id: int('id').primaryKey().autoincrement(),
  currentTrackId: int('current_track_id'),
  currentTime: int('current_time').default(0),
  isPlaying: boolean('is_playing').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});
