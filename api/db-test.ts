import { neon } from '@neondatabase/serverless';

export default async function handler(request: Request) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'DATABASE_URL not set',
        env_keys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('PG'))
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Log the host part of the connection string (without password)
    const hostMatch = databaseUrl.match(/@([^/]+)\//);
    const host = hostMatch ? hostMatch[1] : 'unknown';
    
    console.log('[DB Test] Attempting connection to:', host);
    
    const sql = neon(databaseUrl);
    
    // Simple query to test connection
    const result = await sql`SELECT NOW() as current_time, current_database() as database_name`;
    
    return new Response(JSON.stringify({
      status: 'success',
      message: 'Database connection successful!',
      host: host,
      result: result[0]
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('[DB Test] Error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message || 'Unknown error',
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const config = {
  runtime: 'nodejs',
};
