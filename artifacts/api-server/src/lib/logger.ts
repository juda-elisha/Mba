import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
    ],
    ...(isProduction
      ? {}
      : {
          transport: {
            target: "pino-pretty",
            options: { colorize: true },
          },
        }),
  },
  // In production pass process.stdout directly so pino skips thread-stream
  // entirely — no worker files are spawned, which is essential for Vercel
  // serverless where dynamic worker requires break after ncc re-bundling.
  isProduction ? process.stdout : undefined
);
