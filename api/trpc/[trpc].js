import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../dist/index.js';

export default async function handler(request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: () => ({}),
  });
}

export const config = {
  runtime: 'nodejs',
};
