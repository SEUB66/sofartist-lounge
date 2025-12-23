import { router, publicProcedure } from './trpc.js';
import { db } from './db.js';
import { users, messages, media, sessions, playbackState } from '../drizzle/schema.js';
import { eq, desc, sql, gt } from 'drizzle-orm';
import { z } from 'zod';
import { getUploadUrl, generateS3Key, getPublicUrl } from './s3.js';

// Router pour la présence utilisateur
const presenceRouter = router({
  // Enregistrer ou mettre à jour la présence d'un utilisateur
  updatePresence: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      // Vérifier si une session existe
      const [existingSession] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, input.userId))
        .limit(1);

      if (existingSession) {
        // Mettre à jour le heartbeat
        await db
          .update(sessions)
          .set({ lastHeartbeat: new Date() })
          .where(eq(sessions.userId, input.userId));
      } else {
        // Créer une nouvelle session
        await db.insert(sessions).values({
          userId: input.userId,
          lastHeartbeat: new Date(),
        });
      }

      return { success: true };
    }),

  // Récupérer tous les utilisateurs en ligne
  getOnlineUsers: publicProcedure.query(async () => {
    // Les utilisateurs sont considérés en ligne s'ils ont eu un heartbeat dans les 30 dernières secondes
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

    const onlineUsers = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        profilePhoto: users.profilePhoto,
        nicknameColor: users.nicknameColor,
        mood: users.mood,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(gt(sessions.lastHeartbeat, thirtySecondsAgo));

    return onlineUsers;
  }),

  // Compter les utilisateurs en ligne
  getOnlineCount: publicProcedure.query(async () => {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

    const [result] = await db
      .select({ count: sql`COUNT(*)` })
      .from(sessions)
      .where(gt(sessions.lastHeartbeat, thirtySecondsAgo));

    return result?.count || 0;
  }),
});

// Router pour l'authentification
const authRouter = router({
  // Login ultra simple : juste un nickname
  login: publicProcedure
    .input(z.object({ nickname: z.string().min(1).max(50) }))
    .mutation(async ({ input }) => {
      // Vérifier si l'utilisateur existe
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.nickname, input.nickname))
        .limit(1);

      if (existingUser) {
        // Mettre à jour lastSeenAt
        await db
          .update(users)
          .set({ lastSeenAt: new Date() })
          .where(eq(users.id, existingUser.id));

        return { user: existingUser, isNew: false };
      }

      // Créer un nouvel utilisateur
      const [newUser] = await db
        .insert(users)
        .values({
          nickname: input.nickname,
          nicknameColor: '#00ffff',
          mood: '😊',
        })
        .$returningId();

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, newUser.id))
        .limit(1);

      return { user, isNew: true };
    }),

  // Récupérer l'utilisateur courant (par ID)
  me: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      return user || null;
    }),
});

// Router pour le chat
const chatRouter = router({
  // Récupérer les messages récents
  getMessages: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const msgs = await db
        .select({
          id: messages.id,
          content: messages.content,
          createdAt: messages.createdAt,
          userId: messages.userId,
          nickname: users.nickname,
          nicknameColor: users.nicknameColor,
          mood: users.mood,
          profilePhoto: users.profilePhoto,
        })
        .from(messages)
        .leftJoin(users, eq(messages.userId, users.id))
        .orderBy(desc(messages.createdAt))
        .limit(input.limit);

      return msgs.reverse();
    }),

  // Envoyer un message
  sendMessage: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        content: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input }) => {
      const [msg] = await db
        .insert(messages)
        .values({
          userId: input.userId,
          content: input.content,
        })
        .$returningId();

      return { success: true, messageId: msg.id };
    }),

  // Récupérer les utilisateurs en ligne
  getOnlineUsers: publicProcedure.query(async () => {
    // Utilisateurs actifs dans les 5 dernières minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const onlineUsers = await db
      .select({
        id: users.id,
        nickname: users.nickname,
        nicknameColor: users.nicknameColor,
        mood: users.mood,
        profilePhoto: users.profilePhoto,
        lastSeenAt: users.lastSeenAt,
      })
      .from(users)
      .where(gt(users.lastSeenAt, fiveMinutesAgo));

    return onlineUsers;
  }),

  // Heartbeat pour indiquer qu'on est en ligne
  heartbeat: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(users)
        .set({ lastSeenAt: new Date() })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),
});

// Router pour les settings utilisateur
const settingsRouter = router({
  // Mettre à jour le profil
  updateProfile: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        profilePhoto: z.string().optional(),
        nicknameColor: z.string().optional(),
        mood: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, ...updates } = input;

      await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId));

      return { success: true };
    }),
});

// Router pour l'upload de médias
const uploadRouter = router({
  // Obtenir une URL présignée pour uploader un fichier
  getUploadUrl: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        type: z.enum(['music', 'image']),
        filename: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const key = generateS3Key(input.userId, input.type, input.filename);
      const uploadUrl = await getUploadUrl(key, input.contentType);
      const publicUrl = getPublicUrl(key);

      return {
        uploadUrl,
        publicUrl,
        key,
      };
    }),

  // Lister tous les médias
  listMedia: publicProcedure
    .input(z.object({ type: z.enum(['music', 'image']).optional() }))
    .query(async ({ input }) => {
      let query = db
        .select({
          id: media.id,
          userId: media.userId,
          type: media.type,
          title: media.title,
          fileUrl: media.fileUrl,
          coverUrl: media.coverUrl,
          mimeType: media.mimeType,
          size: media.size,
          createdAt: media.createdAt,
          uploaderNickname: users.nickname,
        })
        .from(media)
        .leftJoin(users, eq(media.userId, users.id))
        .orderBy(desc(media.createdAt));

      if (input.type) {
        query = query.where(eq(media.type, input.type)) as any;
      }

      return await query;
    }),

  // Ajouter un média (sera complété avec S3 upload)
  addMedia: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        type: z.enum(['music', 'image']),
        title: z.string(),
        fileUrl: z.string(),
        coverUrl: z.string().optional(),
        fileKey: z.string(),
        mimeType: z.string().optional(),
        size: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [newMedia] = await db
        .insert(media)
        .values(input)
        .$returningId();

      return { success: true, mediaId: newMedia.id };
    }),

  // Supprimer un média
  deleteMedia: publicProcedure
    .input(z.object({ mediaId: z.number(), userId: z.number() }))
    .mutation(async ({ input }) => {
      // Vérifier que l'utilisateur est le propriétaire
      const [mediaItem] = await db
        .select()
        .from(media)
        .where(eq(media.id, input.mediaId))
        .limit(1);

      if (!mediaItem || mediaItem.userId !== input.userId) {
        throw new Error('Unauthorized');
      }

      await db.delete(media).where(eq(media.id, input.mediaId));

      return { success: true, fileKey: mediaItem.fileKey };
    }),
});

// Router pour la lecture synchronisee (RetroTV)
const playbackRouter = router({
  getPlaybackState: publicProcedure.query(async () => {
    const [state] = await db.select().from(playbackState).limit(1);
    if (!state) {
      await db.insert(playbackState).values({
        currentTrackId: null,
        currentTime: 0,
        isPlaying: false,
      });
      return { currentTrackId: null, currentTime: 0, isPlaying: false };
    }
    return state;
  }),

  setCurrentTrack: publicProcedure
    .input(z.object({ trackId: z.number().nullable() }))
    .mutation(async ({ input }) => {
      const [state] = await db.select().from(playbackState).limit(1);
      if (state) {
        await db.update(playbackState).set({
          currentTrackId: input.trackId,
          currentTime: 0,
          isPlaying: !!input.trackId,
          updatedAt: new Date(),
        }).where(eq(playbackState.id, state.id));
      } else {
        await db.insert(playbackState).values({
          currentTrackId: input.trackId,
          currentTime: 0,
          isPlaying: !!input.trackId,
        });
      }
      return { success: true };
    }),

  setCurrentTime: publicProcedure
    .input(z.object({ currentTime: z.number() }))
    .mutation(async ({ input }) => {
      const [state] = await db.select().from(playbackState).limit(1);
      if (state) {
        await db.update(playbackState).set({
          currentTime: input.currentTime,
          updatedAt: new Date(),
        }).where(eq(playbackState.id, state.id));
      }
      return { success: true };
    }),

  setIsPlaying: publicProcedure
    .input(z.object({ isPlaying: z.boolean() }))
    .mutation(async ({ input }) => {
      const [state] = await db.select().from(playbackState).limit(1);
      if (state) {
        await db.update(playbackState).set({
          isPlaying: input.isPlaying,
          updatedAt: new Date(),
        }).where(eq(playbackState.id, state.id));
      }
      return { success: true };
    }),
});

// Router principal
export const appRouter = router({
  auth: authRouter,
  chat: chatRouter,
  settings: settingsRouter,
  upload: uploadRouter,
  presence: presenceRouter,
  playback: playbackRouter,
});

export type AppRouter = typeof appRouter;
