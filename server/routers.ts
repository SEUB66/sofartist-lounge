import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { authenticateUser } from "./auth";
import { SignJWT } from "jose";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getRecentMessages,
  createMessage,
  getMediaByType,
  createMedia,
  deleteMedia,
  getAllPosts,
  createPost,
  deletePost,
  updateUserActivity,
  getOnlineUsersCount,
} from "./db-helpers";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(
        z.object({
          username: z.string().min(1, "Username is required"),
          password: z.string().min(1, "Password is required"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await authenticateUser(input.username, input.password);

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid username or password",
          });
        }

        // Create JWT token with all required fields
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key");
        const openId = user.openId || `custom-${user.id}`;
        const token = await new SignJWT({ 
          openId,
          appId: process.env.VITE_APP_ID || "devcave-bar",
          name: user.name || user.username
        })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(secret);

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            authorized: user.authorized || 0,
            profilePhoto: user.profilePhoto,
            customIcon: user.customIcon,
          },
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Chat router
  chat: router({
    getMessages: protectedProcedure.query(async () => {
      return await getRecentMessages(100);
    }),
    sendMessage: protectedProcedure
      .input(z.object({ content: z.string().min(1).max(1000) }))
      .mutation(async ({ input, ctx }) => {
        await createMessage({
          userId: ctx.user.id,
          content: input.content,
        });
        return { success: true };
      }),
  }),

  // Media router (Radio + Board)
  media: router({
    getAudio: protectedProcedure.query(async () => {
      return await getMediaByType("audio");
    }),
    getImages: protectedProcedure.query(async () => {
      return await getMediaByType("image");
    }),
    upload: protectedProcedure
      .input(
        z.object({
          type: z.enum(["audio", "image"]),
          filename: z.string(),
          url: z.string(),
          fileKey: z.string(),
          mimeType: z.string().optional(),
          size: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createMedia({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteMedia(input.id);
        return { success: true };
      }),
  }),

  // Wall router
  wall: router({
    getPosts: protectedProcedure.query(async () => {
      return await getAllPosts();
    }),
    createPost: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          content: z.string().min(1),
          imageUrl: z.string().optional(),
          videoUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createPost({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    deletePost: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePost(input.id);
        return { success: true };
      }),
  }),

  // Session router
  session: router({
    heartbeat: protectedProcedure.mutation(async ({ ctx }) => {
      await updateUserActivity(ctx.user.id);
      return { success: true };
    }),
    getOnlineCount: protectedProcedure.query(async () => {
      return await getOnlineUsersCount();
    }),
  }),

  // Admin router
  admin: router({
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      // Only admins can access
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      }
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { users } = await import("../drizzle/schema");
      return await db.select().from(users);
    }),
    createUser: protectedProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
        name: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        const bcrypt = await import("bcrypt");
        const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { users } = await import("../drizzle/schema");
        
        const hashedPassword = await bcrypt.hash(input.password, 10);
        await db.insert(users).values({
          username: input.username,
          password: hashedPassword,
          name: input.name || input.username,
          role: "user",
          authorized: 0,
        });
        return { success: true };
      }),
    toggleAuthorization: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { users } = await import("../drizzle/schema");
        const { eq, sql } = await import("drizzle-orm");
        
        // Toggle: if authorized = 1, set to 0, else set to 1
        await db.update(users)
          .set({ authorized: sql`CASE WHEN authorized = 1 THEN 0 ELSE 1 END` })
          .where(eq(users.id, input.userId));
        return { success: true };
      }),
    deleteUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        await db.delete(users).where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),
  radio: router({
    list: publicProcedure.query(async () => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const { media, users } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      const tracks = await db.select({
        id: media.id,
        title: media.filename,
        url: media.url,
        uploadedBy: users.username,
      })
      .from(media)
      .leftJoin(users, eq(media.userId, users.id))
      .where(eq(media.type, "audio"))
      .orderBy(media.createdAt);
      
      return tracks;
    }),
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check authorization
        if (ctx.user.role !== "admin" && ctx.user.authorized !== 1) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to upload" });
        }
        
        // Upload to S3
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.fileData.split(",")[1], "base64");
        const timestamp = Date.now();
        const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const key = `radio/${timestamp}-${sanitizedName}`;
        const result = await storagePut(key, buffer, input.contentType);
        
        // Save to DB
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { media } = await import("../drizzle/schema");
        
        await db.insert(media).values({
          type: "audio",
          userId: ctx.user.id,
          filename: input.fileName,
          url: result.url,
          fileKey: key,
          mimeType: input.contentType,
        });
        
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { media } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        
        // Only admin or uploader can delete
        const track = await db.select().from(media).where(eq(media.id, input.id)).limit(1);
        if (track.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });
        }
        
        if (ctx.user.role !== "admin" && track[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed" });
        }
        
        await db.delete(media).where(eq(media.id, input.id));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
