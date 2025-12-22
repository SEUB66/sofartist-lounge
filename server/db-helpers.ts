import { desc, eq } from "drizzle-orm";
import { messages, media, posts, InsertMessage, InsertMedia, InsertPost } from "../drizzle/schema";
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
