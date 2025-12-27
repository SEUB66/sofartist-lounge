import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema.js';

console.log('[DB] Initializing database connection...');
console.log('[DB] POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
console.log('[DB] DATABASE_URL exists:', !!process.env.DATABASE_URL);

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[DB] FATAL: No database connection string found!');
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
}

console.log('[DB] Connection string found, creating postgres.js client...');

// postgres.js with SSL for serverless PostgreSQL (works with Neon, Railway, etc.)
const queryClient = postgres(connectionString, {
  max: 10, // Railway: more connections allowed
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require', // Require SSL
});

console.log('[DB] postgres.js client created successfully');

export const db = drizzle(queryClient, { schema });

console.log('[DB] Drizzle ORM initialized successfully');
