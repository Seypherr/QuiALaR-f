import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { config } from './config.js';

let client;
let initPromise;

function getClientOptions() {
  const options = {
    url: config.db.url,
  };

  if (config.db.authToken) {
    options.authToken = config.db.authToken;
  }

  return options;
}

async function ensureFileDatabaseDirectory() {
  if (!config.db.url.startsWith('file:')) {
    return;
  }

  const databasePath = config.db.url.slice('file:'.length);
  const directory = path.dirname(databasePath);

  await fs.mkdir(directory, { recursive: true });
}

function parseSqlStatements(sqlText) {
  return sqlText
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function executeSqlFile(executor, filename) {
  const filepath = path.join(process.cwd(), filename);
  const sql = await fs.readFile(filepath, 'utf8');
  const statements = parseSqlStatements(sql);

  for (const statement of statements) {
    await executor.execute(statement);
  }
}

async function initializeDatabase() {
  await ensureFileDatabaseDirectory();

  const db = getClient();
  await db.execute('PRAGMA foreign_keys = ON');

  const tableCheck = await db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'rooms'",
  );

  if (!tableCheck.rows.length && !config.db.url.startsWith('file:') && !config.db.bootstrapOnStart) {
    throw new Error(
      'La base Turso n est pas initialisee. Lancez le script de bootstrap avant de demarrer l application.',
    );
  }

  await executeSqlFile(db, 'database/turso-schema.sql');
  await executeSqlFile(db, 'database/turso-seed.sql');
}

export function getClient() {
  if (!client) {
    client = createClient(getClientOptions());
  }

  return client;
}

export async function ensureDatabaseReady() {
  if (!initPromise) {
    initPromise = initializeDatabase();
  }

  await initPromise;
}

export async function withConnection(handler) {
  await ensureDatabaseReady();
  const db = getClient();
  await db.execute('PRAGMA foreign_keys = ON');
  return handler(db);
}

export async function withTransaction(handler) {
  await ensureDatabaseReady();
  const db = getClient();
  const transaction = await db.transaction('write');

  try {
    const result = await handler(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    if (typeof transaction.close === 'function') {
      try {
        await transaction.close();
      } catch {
        // libsql can already close the transaction after commit/rollback.
      }
    }
  }
}

export async function bootstrapDatabase() {
  initPromise = initializeDatabase();
  await initPromise;
}

export async function testDatabaseConnection() {
  try {
    await ensureDatabaseReady();
    const rows = await getClient().execute(
      'SELECT sqlite_version() AS version, CURRENT_TIMESTAMP AS server_time',
    );

    return {
      ok: true,
      databaseUrl: config.db.url,
      version: rows.rows[0]?.version ?? null,
      serverTime: rows.rows[0]?.server_time ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}
