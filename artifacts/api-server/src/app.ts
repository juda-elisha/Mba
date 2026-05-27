import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust the reverse proxy (Replit, Vercel, etc.) so rate limiting uses the real client IP
app.set("trust proxy", 1);

// Security: set secure HTTP headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // allow offerwall iframes
    contentSecurityPolicy: false,     // managed by frontend
  }),
);

// Security: rate limiting — prevent brute force and abuse
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." },
});

app.use(globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// CORS — restrict to known origins in production, allow all in dev
function buildAllowedOrigins(): string[] | null {
  if (process.env["NODE_ENV"] !== "production") return null; // null = allow all in dev

  const origins: string[] = [];

  // Replit deployment domains
  const replitDomains = (process.env["REPLIT_DOMAINS"] ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
  for (const d of replitDomains) origins.push(`https://${d}`);

  // Vercel deployment domains (VERCEL_URL is the auto-assigned preview URL)
  if (process.env["VERCEL_URL"]) origins.push(`https://${process.env["VERCEL_URL"]}`);

  // Custom domain(s) via env var — comma-separated full URLs, e.g. https://myapp.com
  const custom = (process.env["ALLOWED_ORIGINS"] ?? "").split(",").map((o) => o.trim()).filter(Boolean);
  origins.push(...custom);

  return origins.length > 0 ? origins : null; // null falls back to allow-all
}

const allowedOrigins = buildAllowedOrigins();

app.use(
  cors({
    origin: allowedOrigins ?? "*",
    credentials: true,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Body parsing — limit size to prevent abuse
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use("/api", router);

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
