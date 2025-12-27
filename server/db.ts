import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema.js';

console.log('[DB] Initializing database with postgres.js...');

if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
}

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// postgres.js with SSL for Railway PostgreSQL
const queryClient = postgres(connectionString!, {
  max: 1, // Serverless: minimal connections
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require', // Railway requires SSL
});

export const db = drizzle(queryClient, { schema });

console.log('[DB] Database initialized successfully');
