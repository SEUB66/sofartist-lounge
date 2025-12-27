import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../drizzle/schema.js';

const { Pool } = pg;

console.log('[DB] Initializing database with node-postgres...');

if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
}

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Create pool with serverless-friendly configuration
const pool = new Pool({
  connectionString,
  max: 1, // Serverless: use minimal connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

console.log('[DB] Database initialized successfully');
