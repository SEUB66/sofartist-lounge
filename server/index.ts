// Last updated: 2025-12-26 18:35 UTC - Fixed tRPC routes to /trpc
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers.js";

// Export for Vercel serverless functions
export { appRouter };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const isProduction = process.env.NODE_ENV === "production";

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Logging middleware
  app.use('/trpc', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  // tRPC endpoint
  app.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
    })
  );

  if (isProduction) {
    // Serve static files in production
    const staticPath = path.resolve(__dirname, "public");
    app.use(express.static(staticPath));

    // Handle client-side routing (MUST be after API routes)
    app.get("*", (_req, res) => {
      const indexPath = path.join(staticPath, "index.html");
      console.log('[Static] Serving index.html from:', indexPath);
      res.sendFile(indexPath);
    });
  } else {
    // Development: Integrate Vite
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server: server
        }
      },
      appType: "spa",
      root: path.resolve(__dirname, "..", "client"),
      configFile: path.resolve(__dirname, "..", "vite.config.ts"),
    });

    app.use(vite.middlewares);
  }

  const port = process.env.PORT || 3000;

  server.listen(Number(port), '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${port}/`);
    console.log(`📡 tRPC endpoint: http://0.0.0.0:${port}/trpc`);
  });
}

startServer().catch(console.error);
