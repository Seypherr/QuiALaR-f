import dotenv from 'dotenv';

dotenv.config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toOrigins(value) {
  return String(value ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  port: toNumber(process.env.PORT, 3001),
  clientOrigins: toOrigins(process.env.CLIENT_ORIGIN),
  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'enigma',
    connectionLimit: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
  },
  game: {
    defaultEliminationIntervalSeconds: toNumber(
      process.env.DEFAULT_ELIMINATION_INTERVAL_SECONDS,
      120,
    ),
    defaultMaxPlayers: toNumber(process.env.DEFAULT_MAX_PLAYERS, 20),
  },
};
