import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, messages, media, posts } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

describe("Apple Punk Hub API Tests", () => {
  let testUserId: number;
  let testContext: any;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if test user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, "testuser"))
      .limit(1);

    if (existingUser.length > 0) {
      testUserId = existingUser[0].id;
    } else {
      // Create a test user
      const hashedPassword = await hashPassword("testpass");
      const result = await db.insert(users).values({
        username: "testuser",
        password: hashedPassword,
        name: "Test User",
        role: "admin",
        loginMethod: "custom",
        openId: null,
      });

      testUserId = Number(result[0].insertId);
    }

    // Mock context for protected procedures
    testContext = {
      user: {
        id: testUserId,
        username: "testuser",
        name: "Test User",
        role: "admin",
      },
      req: {
        headers: {
          "x-forwarded-proto": "https",
        },
        protocol: "https",
      },
      res: {
        cookie: () => {},
        clearCookie: () => {},
      },
    };
  });

  describe("Authentication", () => {
    it("should authenticate user with correct credentials", async () => {
      const caller = appRouter.createCaller(testContext);
      const result = await caller.auth.login({
        username: "testuser",
        password: "testpass",
      });

      expect(result.success).toBe(true);
      expect(result.user?.username).toBe("testuser");
    });

    it("should reject invalid credentials", async () => {
      const caller = appRouter.createCaller(testContext);
      
      await expect(
        caller.auth.login({
          username: "testuser",
          password: "wrongpass",
        })
      ).rejects.toThrow();
    });

    it("should be case-insensitive for username", async () => {
      const caller = appRouter.createCaller(testContext);
      const result = await caller.auth.login({
        username: "TESTUSER",
        password: "testpass",
      });

      expect(result.success).toBe(true);
    });

    it("should return current user info", async () => {
      const caller = appRouter.createCaller(testContext);
      const user = await caller.auth.me();

      expect(user?.id).toBe(testUserId);
      expect(user?.username).toBe("testuser");
    });
  });

  describe("Chat", () => {
    it("should send a message", async () => {
      const caller = appRouter.createCaller(testContext);
      const result = await caller.chat.sendMessage({
        content: "Hello from test!",
      });

      expect(result.success).toBe(true);
    });

    it("should retrieve messages", async () => {
      const caller = appRouter.createCaller(testContext);
      const messages = await caller.chat.getMessages();

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].content).toBe("Hello from test!");
    });

    it("should reject empty messages", async () => {
      const caller = appRouter.createCaller(testContext);
      
      await expect(
        caller.chat.sendMessage({ content: "" })
      ).rejects.toThrow();
    });
  });

  describe("Media (Radio & Board)", () => {
    it("should upload audio file", async () => {
      const caller = appRouter.createCaller(testContext);
      const result = await caller.media.upload({
        type: "audio",
        filename: "test-track.mp3",
        url: "data:audio/mp3;base64,test",
        fileKey: "audio/test-track.mp3",
        mimeType: "audio/mp3",
        size: 1024,
      });

      expect(result.success).toBe(true);
    });

    it("should upload image file", async () => {
      const caller = appRouter.createCaller(testContext);
      const result = await caller.media.upload({
        type: "image",
        filename: "test-image.png",
        url: "data:image/png;base64,test",
        fileKey: "images/test-image.png",
        mimeType: "image/png",
        size: 2048,
      });

      expect(result.success).toBe(true);
    });

    it("should retrieve audio files", async () => {
      const caller = appRouter.createCaller(testContext);
      const audioFiles = await caller.media.getAudio();

      expect(Array.isArray(audioFiles)).toBe(true);
      expect(audioFiles.length).toBeGreaterThan(0);
      expect(audioFiles[0].type).toBe("audio");
    });

    it("should retrieve image files", async () => {
      const caller = appRouter.createCaller(testContext);
      const images = await caller.media.getImages();

      expect(Array.isArray(images)).toBe(true);
      expect(images.length).toBeGreaterThan(0);
      expect(images[0].type).toBe("image");
    });

    it("should delete media file", async () => {
      const caller = appRouter.createCaller(testContext);
      const images = await caller.media.getImages();
      const imageId = images[0].id;

      const result = await caller.media.delete({ id: imageId });
      expect(result.success).toBe(true);

      const updatedImages = await caller.media.getImages();
      expect(updatedImages.find((img) => img.id === imageId)).toBeUndefined();
    });
  });

  describe("Wall", () => {
    it("should create a post", async () => {
      const caller = appRouter.createCaller(testContext);
      const result = await caller.wall.createPost({
        title: "Test Post",
        content: "This is a test post content",
        imageUrl: "https://example.com/image.png",
      });

      expect(result.success).toBe(true);
    });

    it("should retrieve posts", async () => {
      const caller = appRouter.createCaller(testContext);
      const posts = await caller.wall.getPosts();

      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);
      expect(posts[0].title).toBe("Test Post");
    });

    it("should reject post without title", async () => {
      const caller = appRouter.createCaller(testContext);
      
      await expect(
        caller.wall.createPost({
          title: "",
          content: "Content without title",
        })
      ).rejects.toThrow();
    });

    it("should delete a post", async () => {
      const caller = appRouter.createCaller(testContext);
      const posts = await caller.wall.getPosts();
      const postId = posts[0].id;

      const result = await caller.wall.deletePost({ id: postId });
      expect(result.success).toBe(true);

      const updatedPosts = await caller.wall.getPosts();
      expect(updatedPosts.find((p) => p.id === postId)).toBeUndefined();
    });
  });
});
