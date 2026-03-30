import * as mariadb from 'mariadb';
import { config } from './config.js';

let pool;

export function getPool() {
  if (!pool) {
    pool = mariadb.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      connectionLimit: config.db.connectionLimit,
      acquireTimeout: config.db.acquireTimeoutMs,
      connectTimeout: config.db.connectTimeoutMs,
      idleTimeout: config.db.idleTimeoutSeconds,
      bigIntAsNumber: true,
      insertIdAsNumber: true,
    });
  }

  return pool;
}

export async function withConnection(handler) {
  const connection = await getPool().getConnection();

  try {
    return await handler(connection);
  } finally {
    connection.release();
  }
}

export async function withTransaction(handler) {
  return withConnection(async (connection) => {
    await connection.beginTransaction();

    try {
      const result = await handler(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

export async function testDatabaseConnection() {
  try {
    const rows = await withConnection((connection) =>
      connection.query('SELECT DATABASE() AS database_name, VERSION() AS version'),
    );

    return {
      ok: true,
      database: rows[0]?.database_name ?? config.db.database,
      version: rows[0]?.version ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}
