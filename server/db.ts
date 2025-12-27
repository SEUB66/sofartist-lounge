import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../drizzle/schema.js';

console.log('[DB] Initializing database with @neondatabase/serverless...');

if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
}

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Use neon HTTP client which works with any PostgreSQL database
const sql = neon(connectionString!);

export const db = drizzle(sql, { schema });

console.log('[DB] Database initialized successfully');
