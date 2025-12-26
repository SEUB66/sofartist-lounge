export default async function handler(request: Request) {
  return new Response(JSON.stringify({
    status: 'ok',
    message: 'Vercel serverless function is working!',
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV || 'unknown'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export const config = {
  runtime: 'nodejs',
};
