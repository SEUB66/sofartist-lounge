import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from '../drizzle/schema.js';

// Lazy initialization to avoid crashes when DATABASE_URL is not set at import time
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('[DB] Initializing database connection...');
    console.log('[DB] DATABASE_URL host:', databaseUrl.split('@')[1]?.split('/')[0] || 'unknown');
    
    _db = drizzle(sql, { schema });
    
    console.log('[DB] Database connection initialized successfully');
  }
  
  return _db;
}

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    const realDb = getDb();
    const value = (realDb as any)[prop];
    if (typeof value === 'function') {
      return value.bind(realDb);
    }
    return value;
  }
});
