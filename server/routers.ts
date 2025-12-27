import { publicProcedure, router } from './trpc.js';
import { prisma } from './prisma.js';
import { z } from 'zod';
import { getUploadUrl, generateS3Key, getPublicUrl } from './s3.js';
import { hashPassword } from './crypto.js';

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
      const existingUser = await prisma.user.findUnique({
        where: { nickname: input.nickname }
      });

      if (existingUser) {
        // Si l'utilisateur a un mot de passe, vérifier
        if (existingUser.password) {
          if (!input.password) {
            throw new Error('Password required for this nickname');
          }
          const passwordHash = await hashPassword(input.password);
          if (passwordHash !== existingUser.password) {
            throw new Error('Invalid password');
          }
        }
        
        // Mettre à jour lastSeenAt
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { createdAt: new Date() }
        });

        return { user: updatedUser, isNew: false };
      }

      // Créer un nouvel utilisateur
      const passwordHash = input.password ? await hashPassword(input.password) : '';
      
      const newUser = await prisma.user.create({
        data: {
          nickname: input.nickname,
          password: passwordHash,
        }
      });

      return { user: newUser, isNew: true };
    }),

  // Vérifier si un nickname est protégé
  checkNickname: publicProcedure
    .input(z.object({ nickname: z.string().min(1).max(50) }))
    .query(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({
        where: { nickname: input.nickname },
        select: { password: true }
      });

      return {
        exists: !!existingUser,
        requiresPassword: !!(existingUser?.password && existingUser.password !== '')
      };
    }),

  // Récupérer l'utilisateur courant (par ID)
  me: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId }
      });

      return user || null;
    }),
});

// Router pour le chat
const chatRouter = router({
  // Récupérer les messages récents
  getMessages: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const msgs = await prisma.message.findMany({
        take: input.limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      });

      // Flatten the structure to match frontend expectations
      return msgs.reverse().map(msg => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.timestamp,
        userId: msg.userId,
        nickname: msg.user.nickname,
        nicknameColor: '#808080' // Default color for now
      }));
    }),

  // Envoyer un message
  sendMessage: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        content: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input }) => {
      const msg = await prisma.message.create({
        data: {
          userId: input.userId,
          content: input.content,
        }
      });

      return { success: true, messageId: msg.id };
    }),

  // Récupérer les utilisateurs en ligne
  getOnlineUsers: publicProcedure.query(async () => {
    // Utilisateurs actifs dans les 5 dernières minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const onlineUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: fiveMinutesAgo
        }
      },
      select: {
        id: true,
        nickname: true,
        createdAt: true
      }
    });

    return onlineUsers;
  }),

  // Heartbeat pour indiquer qu'on est en ligne
  heartbeat: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.user.update({
        where: { id: input.userId },
        data: { createdAt: new Date() }
      });

      return { success: true };
    }),
});

// Router pour le playback
const playbackRouter = router({
  // Récupérer l'état de lecture
  getPlaybackState: publicProcedure.query(async () => {
    const state = await prisma.playbackState.findFirst();
    return state || {
      currentTime: 0,
      isPlaying: false,
      currentTrack: ''
    };
  }),

  // Mettre à jour l'état de lecture
  updatePlaybackState: publicProcedure
    .input(
      z.object({
        currentTime: z.number().optional(),
        isPlaying: z.boolean().optional(),
        currentTrack: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Supprimer l'ancien état et créer un nouveau
      await prisma.playbackState.deleteMany({});
      
      const state = await prisma.playbackState.create({
        data: {
          currentTime: input.currentTime ?? 0,
          isPlaying: input.isPlaying ?? false,
          currentTrack: input.currentTrack ?? ''
        }
      });

      return state;
    }),
});

// Router pour les instruments
const instrumentRouter = router({
  // Récupérer les instruments actifs
  getActiveInstruments: publicProcedure.query(async () => {
    const instruments = await prisma.activeInstrument.findMany({
      where: { isActive: true }
    });
    return instruments;
  }),

  // Activer/désactiver un instrument
  toggleInstrument: publicProcedure
    .input(
      z.object({
        instrument: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      // Supprimer l'ancien et créer un nouveau
      await prisma.activeInstrument.deleteMany({
        where: { instrument: input.instrument }
      });

      if (input.isActive) {
        await prisma.activeInstrument.create({
          data: {
            instrument: input.instrument,
            isActive: true
          }
        });
      }

      return { success: true };
    }),
});

// Router pour les jam notes
const jamRouter = router({
  // Récupérer les notes
  getNotes: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      const notes = await prisma.jamNote.findMany({
        take: input.limit,
        orderBy: { timestamp: 'desc' }
      });
      return notes.reverse();
    }),

  // Ajouter une note
  addNote: publicProcedure
    .input(z.object({ note: z.string() }))
    .mutation(async ({ input }) => {
      const note = await prisma.jamNote.create({
        data: { note: input.note }
      });
      return { success: true, noteId: note.id };
    }),
});

// Router principal
export const appRouter = router({
  auth: authRouter,
  chat: chatRouter,
  playback: playbackRouter,
  instruments: instrumentRouter,
  jam: jamRouter,
});

export type AppRouter = typeof appRouter;
