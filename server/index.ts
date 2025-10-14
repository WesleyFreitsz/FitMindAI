import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "./auth"; // Importa a configuração do passport
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import memorystore from "memorystore";

const app = express();
const MemoryStore = memorystore(session);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- CONFIGURAÇÃO DE SESSÃO ---
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "a-super-secret-key-for-development-change-it", // Crie uma variável no .env para isso
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000, // 24 horas em ms
    }),
    cookie: {
      maxAge: 86400000, // 24 horas
    },
  })
);

// --- INICIALIZAÇÃO DO PASSPORT ---
app.use(passport.initialize());
app.use(passport.session());

// Logger
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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(err); // Log do erro no console do servidor
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
