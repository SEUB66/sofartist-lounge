import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../server/routers.js';

export default async function handler(request) {
  try {
    console.log('[tRPC Handler] Starting request handling...');
    console.log('[tRPC Handler] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: () => ({}),
    });
    
    console.log('[tRPC Handler] Request handled successfully');
    return response;
  } catch (error) {
    console.error('[tRPC Handler] Fatal error:', error);
    throw error;
  }
}

export const config = {
  runtime: 'nodejs',
};
