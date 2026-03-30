import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { config } from './config.js';
import { testDatabaseConnection } from './db.js';
import { createHttpError, errorHandler, notFoundHandler } from './errors.js';

function withTimeout(handler) {
  return async (request, response, next) => {
    const timeoutError = createHttpError(
      504,
      'La requete a depasse le temps maximum autorise.',
      'REQUEST_TIMEOUT',
    );

    let timeoutId;

    try {
      await Promise.race([
        handler(request, response, next),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(timeoutError), config.http.requestTimeoutMs);
        }),
      ]);
    } catch (error) {
      next(error);
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

export function createApp({
  orchestrator,
  capabilities = {
    runtimeMode: config.runtimeMode,
    realtime: false,
    statefulGameEngine: false,
  },
} = {}) {
  if (!orchestrator) {
    throw new Error('createApp requiert une instance d orchestrator.');
  }

  const app = express();

  app.disable('x-powered-by');
  app.use(
    cors({
      origin: config.clientOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use((request, response, next) => {
    response.locals.requestId = request.headers['x-request-id'] ?? randomUUID();
    response.setHeader('x-request-id', response.locals.requestId);

    const startedAt = Date.now();
    response.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      console.info(
        `[${response.locals.requestId}] ${request.method} ${request.originalUrl} ${response.statusCode} ${durationMs}ms`,
      );
    });

    next();
  });

  app.get('/api/health', withTimeout(async (_request, response) => {
    const db = await testDatabaseConnection();

    response.json({
      ok: true,
      serverTime: Date.now(),
      runtime: {
        mode: capabilities.runtimeMode,
        realtime: capabilities.realtime,
        statefulGameEngine: capabilities.statefulGameEngine,
      },
      db,
    });
  }));

  app.post('/api/rooms', withTimeout(async (request, response) => {
    const result = await orchestrator.createRoom({
      hostName: request.body?.hostName ?? null,
      themeId: request.body?.themeId ?? null,
      eliminationIntervalSeconds: request.body?.eliminationIntervalSeconds,
      maxPlayers: request.body?.maxPlayers,
    });

    response.status(201).json({
      ok: true,
      room: result.room,
      state: result.state,
    });
  }));

  app.post('/api/rooms/:roomCode/players', withTimeout(async (request, response) => {
    const result = await orchestrator.joinRoom(
      request.params.roomCode,
      request.body?.nickname,
    );

    response.status(201).json({
      ok: true,
      room: result.room,
      player: result.player,
      state: result.state,
    });
  }));

  app.post('/api/rooms/:roomCode/start', withTimeout(async (request, response) => {
    if (!capabilities.statefulGameEngine) {
      throw createHttpError(
        501,
        'Le moteur de partie temps reel n est pas compatible avec Vercel Functions. Deployez le backend stateful hors Vercel.',
        'REALTIME_ENGINE_UNSUPPORTED',
      );
    }

    const state = await orchestrator.startRoom(request.params.roomCode);

    response.json({
      ok: true,
      state,
    });
  }));

  app.get('/api/rooms/:roomCode/state', withTimeout(async (request, response) => {
    if (!capabilities.statefulGameEngine) {
      const room = await orchestrator.requireRoom(request.params.roomCode);

      if (room.status !== 'lobby') {
        throw createHttpError(
          501,
          'La lecture d une partie en cours exige un runtime stateful. Sur Vercel, gardez uniquement le frontend et deployez le backend temps reel a part.',
          'ROOM_STATEFUL_RUNTIME_REQUIRED',
        );
      }
    }

    const state = await orchestrator.getState(request.params.roomCode, {
      role: request.query.role ?? 'spectator',
      playerId: request.query.playerId ? Number(request.query.playerId) : null,
    });

    response.json({
      ok: true,
      state,
    });
  }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
