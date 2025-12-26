import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../drizzle/schema.js';

console.log('[DB] Using DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
