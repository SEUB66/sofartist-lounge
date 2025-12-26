import { pgTable, varchar, text, timestamp, serial, integer, boolean } from 'drizzle-orm/pg-core';

// Table des utilisateurs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nickname: varchar('nickname', { length: 50 }).notNull().unique(),
  profilePhoto: text('profile_photo'), // URL de la photo de profil
  nicknameColor: varchar('nickname_color', { length: 7 }).default('#00ffff'), // Couleur hex
  mood: varchar('mood', { length: 10 }).default('😊'), // Emoji mood
  tvStyle: varchar('tv_style', { length: 20 }).default('1970s'), // Style de TV préféré
  passwordHash: text('password_hash'), // Mot de passe optionnel (bcrypt hash)
  createdAt: timestamp('created_at').defaultNow(),
  lastSeenAt: timestamp('last_seen_at').defaultNow(),
});

// Table des messages de chat
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Table des médias uploadés (musique + images)
export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  type: varchar('type', { length: 10 }).notNull(), // 'music' ou 'image'
  title: varchar('title', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(), // URL S3
  coverUrl: text('cover_url'), // URL de la cover (pour musique)
  fileKey: text('file_key').notNull(), // Clé S3 pour suppression
  mimeType: varchar('mime_type', { length: 100 }),
  size: integer('size'), // Taille en bytes
  likes: integer('likes').default(0), // Compteur de likes
  dislikes: integer('dislikes').default(0), // Compteur de dislikes
  createdAt: timestamp('created_at').defaultNow(),
});

// Table des sessions (pour tracking utilisateurs en ligne)
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique(),
  lastHeartbeat: timestamp('last_heartbeat').defaultNow(),
});

// Table de l'etat de lecture (synchronisation RetroTV)
export const playbackState = pgTable('playback_state', {
  id: serial('id').primaryKey(),
  currentTrackId: integer('current_track_id'),
  currentTime: integer('current_time').default(0),
  isPlaying: boolean('is_playing').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});
