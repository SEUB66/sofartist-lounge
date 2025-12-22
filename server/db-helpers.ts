import { desc, eq, sql, gt } from "drizzle-orm";
import { messages, media, posts, sessions, InsertMessage, InsertMedia, InsertPost, InsertSession } from "../drizzle/schema";
import { getDb } from "./db";

// ============================================
// CHAT MESSAGES
// ============================================

export async function getRecentMessages(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(message);
  return result;
}

// ============================================
// MEDIA (RADIO MP3s & BOARD IMAGES)
// ============================================

export async function getMediaByType(type: "audio" | "image") {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(media)
    .where(eq(media.type, type))
    .orderBy(desc(media.createdAt));
}

export async function createMedia(mediaItem: InsertMedia) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(media).values(mediaItem);
  return result;
}

export async function deleteMedia(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(media).where(eq(media.id, id));
}

// ============================================
// WALL POSTS
// ============================================

export async function getAllPosts() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt));
}

export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(posts).values(post);
  return result;
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(posts).where(eq(posts.id, id));
}

// ============================================
// SESSIONS (ONLINE USERS)
// ============================================

export async function updateUserActivity(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete old session if exists
  await db.delete(sessions).where(eq(sessions.userId, userId));
  
  // Create new session
  await db.insert(sessions).values({
    userId,
    lastActivity: new Date(),
  });
}

export async function getOnlineUsersCount() {
  const db = await getDb();
  if (!db) return 0;
  
  // Consider users online if they were active in the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const result = await db
    .select({ count: sql<number>`count(distinct ${sessions.userId})` })
    .from(sessions)
    .where(gt(sessions.lastActivity, fiveMinutesAgo));
  
  return result[0]?.count || 0;
}

export async function cleanupOldSessions() {
  const db = await getDb();
  if (!db) return;
  
  // Delete sessions older than 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  await db.delete(sessions).where(sql`${sessions.lastActivity} < ${tenMinutesAgo}`);
}
