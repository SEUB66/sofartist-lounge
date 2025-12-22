import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Simple password hashing using Node.js crypto
 * For production, consider using bcrypt or argon2
 */
export async function hashPassword(password: string): Promise<string> {
  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Authenticate user with username and password (case-insensitive)
 */
export async function authenticateUser(username: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Normalize username to lowercase for case-insensitive comparison
  const normalizedUsername = username.toLowerCase();

  // Find user by username (case-insensitive)
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, normalizedUsername))
    .limit(1);

  const user = result[0];

  if (!user || !user.password) {
    return null;
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  // Update last signed in timestamp
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));

  return user;
}
