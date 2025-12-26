import { publicProcedure, router } from './trpc.js';
import { db } from './db.js';
import { users, messages, media, sessions, playbackState, activeInstruments, jamNotes } from '../drizzle/schema.js';
import { eq, desc, sql, gt } from 'drizzle-orm';
import { z } from 'zod';
import { getUploadUrl, generateS3Key, getPublicUrl } from './s3.js';
import { hashPassword } from './crypto';

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
  // Login avec nickname et mot de passe optionnel
  login: publicProcedure
    .input(z.object({ 
      nickname: z.string().min(1).max(50),
      password: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // Vérifier si l'utilisateur existe
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.nickname, input.nickname))
        .limit(1);

      if (existingUser) {
        // Si l'utilisateur a un mot de passe, vérifier
        if (existingUser.passwordHash) {
          // Utilisateur protégé par mot de passe
          if (!input.password) {
            throw new Error('Password required for this nickname');
          }
          const passwordHash = await hashPassword(input.password);
          const isValid = passwordHash === existingUser.passwordHash;
          if (!isValid) {
            throw new Error('Invalid password');
          }
        } else {
          // Utilisateur SANS mot de passe - connexion libre
          // Pas de vérification nécessaire
        }
        
        // Mettre à jour lastSeenAt
        await db
          .update(users)
          .set({ lastSeenAt: new Date() })
          .where(eq(users.id, existingUser.id));

        return { user: existingUser, isNew: false };
      }

      // Créer un nouvel utilisateur
      const passwordHash = input.password ? await hashPassword(input.password) : null;
      
      const [newUser] = await db
        .insert(users)
        .values({
          nickname: input.nickname,
          nicknameColor: '#00ffff',
          mood: '😊',
          passwordHash: passwordHash,
        })
        .returning();

      return { user: newUser, isNew: true };
    }),

  // Vérifier si un nickname est protégé
  checkNickname: publicProcedure
    .input(z.object({ nickname: z.string().min(1).max(50) }))
    .query(async ({ input }) => {
      const [existingUser] = await db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.nickname, input.nickname))
        .limit(1);

      return {
        exists: !!existingUser,
        requiresPassword: !!(existingUser?.passwordHash)
      };
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
        .returning();

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
        password: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, password, ...updates } = input;
      
      // Si un mot de passe est fourni, le hasher
      const finalUpdates: any = { ...updates };
      if (password !== undefined) {
        if (password === '') {
          // Mot de passe vide = supprimer la protection
          finalUpdates.passwordHash = null;
        } else {
          // Hasher le nouveau mot de passe
          finalUpdates.passwordHash = await hashPassword(password);
        }
      }

      await db
        .update(users)
        .set(finalUpdates)
        .where(eq(users.id, userId));

      return { success: true };
    }),

  // Mettre à jour le style de TV
  updateTvStyle: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        tvStyle: z.enum(['1960s', '1970s', '1980s', '1990s', 'crt']),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(users)
        .set({ tvStyle: input.tvStyle })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Récupérer le style de TV d'un utilisateur
  getTvStyle: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const [user] = await db
        .select({ tvStyle: users.tvStyle })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      return user?.tvStyle || '1990s';
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
          likes: media.likes,
          dislikes: media.dislikes,
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
        .returning();

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

  // Liker un média
  likeMedia: publicProcedure
    .input(z.object({ mediaId: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(media)
        .set({ likes: sql`${media.likes} + 1` })
        .where(eq(media.id, input.mediaId));

      const [updated] = await db
        .select({ likes: media.likes })
        .from(media)
        .where(eq(media.id, input.mediaId))
        .limit(1);

      return { success: true, likes: updated?.likes || 0 };
    }),

  // Disliker un média
  dislikeMedia: publicProcedure
    .input(z.object({ mediaId: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(media)
        .set({ dislikes: sql`${media.dislikes} + 1` })
        .where(eq(media.id, input.mediaId));

      const [updated] = await db
        .select({ dislikes: media.dislikes })
        .from(media)
        .where(eq(media.id, input.mediaId))
        .limit(1);

      return { success: true, dislikes: updated?.dislikes || 0 };
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

// Router pour la jam session
const jamRouter = router({  // Sélectionner un instrument
  selectInstrument: publicProcedure
    .input(z.object({ 
      userId: z.number(), 
      instrument: z.string() 
    }))
    .mutation(async ({ input }) => {
      // Vérifier si l'utilisateur a déjà un instrument
      const [existing] = await db
        .select()
        .from(activeInstruments)
        .where(eq(activeInstruments.userId, input.userId))
        .limit(1);

      if (existing) {
        // Mettre à jour l'instrument
        await db
          .update(activeInstruments)
          .set({ 
            instrument: input.instrument,
            lastActivity: new Date()
          })
          .where(eq(activeInstruments.userId, input.userId));
      } else {
        // Créer un nouvel instrument actif
        await db.insert(activeInstruments).values({
          userId: input.userId,
          instrument: input.instrument,
          isPlaying: false,
          lastActivity: new Date(),
        });
      }

      return { success: true };
    }),

  // Récupérer tous les instruments actifs
  getActiveInstruments: publicProcedure.query(async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const instruments = await db
      .select({
        id: activeInstruments.id,
        userId: activeInstruments.userId,
        instrument: activeInstruments.instrument,
        isPlaying: activeInstruments.isPlaying,
        nickname: users.nickname,
        nicknameColor: users.nicknameColor,
      })
      .from(activeInstruments)
      .innerJoin(users, eq(activeInstruments.userId, users.id))
      .where(gt(activeInstruments.lastActivity, fiveMinutesAgo));

    return instruments;
  }),

  // Jouer une note
  playNote: publicProcedure
    .input(z.object({
      userId: z.number(),
      instrument: z.string(),
      note: z.string(),
      velocity: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      // Enregistrer la note
      await db.insert(jamNotes).values({
        userId: input.userId,
        instrument: input.instrument,
        note: input.note,
        velocity: input.velocity || 100,
        timestamp: new Date(),
      });

      // Mettre à jour l'activité
      await db
        .update(activeInstruments)
        .set({ 
          isPlaying: true,
          lastActivity: new Date()
        })
        .where(eq(activeInstruments.userId, input.userId));

      return { success: true };
    }),

  // Arrêter de jouer
  stopPlaying: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(activeInstruments)
        .set({ isPlaying: false })
        .where(eq(activeInstruments.userId, input.userId));

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
  jam: jamRouter,
});

export type AppRouter = typeof appRouter;
