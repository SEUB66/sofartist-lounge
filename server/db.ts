import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../drizzle/schema.js';

console.log('[DB] Using DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
