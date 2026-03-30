import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toOrigins(value) {
  const origins = String(value ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }

  return [...new Set(origins)];
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  runtimeMode: process.env.ENIGMA_RUNTIME_MODE
    ?? (process.env.VERCEL ? 'serverless' : 'persistent'),
  isVercel: Boolean(process.env.VERCEL),
  port: toNumber(process.env.PORT, 3001),
  clientOrigins: toOrigins(process.env.CLIENT_ORIGIN),
  db: {
    url: process.env.TURSO_DATABASE_URL
      ?? `file:${path.join(process.cwd(), 'data', 'local.db')}`,
    authToken: process.env.TURSO_AUTH_TOKEN ?? '',
    bootstrapOnStart: String(process.env.TURSO_BOOTSTRAP_ON_START ?? 'false') === 'true',
  },
  http: {
    requestTimeoutMs: toNumber(process.env.REQUEST_TIMEOUT_MS, 10000),
    pollingIntervalMs: toNumber(process.env.POLLING_INTERVAL_MS, 1000),
  },
  game: {
    defaultEliminationIntervalSeconds: toNumber(
      process.env.DEFAULT_ELIMINATION_INTERVAL_SECONDS,
      120,
    ),
    defaultMaxPlayers: toNumber(process.env.DEFAULT_MAX_PLAYERS, 8),
  },
};
