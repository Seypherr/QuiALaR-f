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
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'enigma',
    connectionLimit: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
    connectTimeoutMs: toNumber(process.env.DB_CONNECT_TIMEOUT_MS, 5000),
    acquireTimeoutMs: toNumber(process.env.DB_ACQUIRE_TIMEOUT_MS, 10000),
    idleTimeoutSeconds: toNumber(process.env.DB_IDLE_TIMEOUT_SECONDS, 30),
  },
  http: {
    requestTimeoutMs: toNumber(process.env.REQUEST_TIMEOUT_MS, 10000),
  },
  game: {
    defaultEliminationIntervalSeconds: toNumber(
      process.env.DEFAULT_ELIMINATION_INTERVAL_SECONDS,
      120,
    ),
    defaultMaxPlayers: toNumber(process.env.DEFAULT_MAX_PLAYERS, 8),
  },
};
