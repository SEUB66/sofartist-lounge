import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema.js';

console.log('[DB] Initializing database with postgres.js...');

if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
}

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// postgres.js is designed for serverless and works with any PostgreSQL database
const queryClient = postgres(connectionString!, {
  max: 1, // Serverless: use minimal connections
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });

console.log('[DB] Database initialized successfully');
