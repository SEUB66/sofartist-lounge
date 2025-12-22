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

        // Create JWT token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key");
        const token = await new SignJWT({ openId: user.openId || `custom-${user.id}` })
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
});

export type AppRouter = typeof appRouter;
