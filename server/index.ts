import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "./auth.js";
import { registerRoutes } from "./routes.js";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";

const app = express();
const PgStore = connectPgSimple(session);
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- CONFIGURAÇÃO DE SESSÃO COM POSTGRES ---
app.use(
  session({
    store: new PgStore({
      pool: pgPool,
      tableName: "user_sessions", // Nome da tabela para guardar as sessões
      createTableIfMissing: true,
    }),
    secret:
      process.env.SESSION_SECRET ||
      "a-super-secret-key-for-development-change-it",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    },
  })
);

// --- INICIALIZAÇÃO DO PASSPORT ---
app.use(passport.initialize());
app.use(passport.session());

(async () => {
  // Logger dinâmico
  const { log } = await import("./vite.js").catch(() => ({ log: console.log }));
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (req.path.startsWith("/api")) {
        log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(err);
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`Server listening on port ${port}`);
  });
})();
