import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from '../drizzle/schema.js';

console.log('[DB] Initializing database with @vercel/postgres...');

// Use sql directly - it automatically uses DATABASE_URL or POSTGRES_URL
export const db = drizzle(sql, { schema });

console.log('[DB] Database initialized successfully');
