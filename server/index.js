import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { config } from './config.js';
import { testDatabaseConnection } from './db.js';
import { GameOrchestrator } from './services/gameOrchestrator.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.clientOrigins,
    credentials: true,
  },
});

const orchestrator = new GameOrchestrator(io);

function respond(callback, payload) {
  if (typeof callback === 'function') {
    callback(payload);
  }
}

function handleHttpError(response, error) {
  response.status(400).json({
    ok: false,
    error: error.message,
  });
}

app.use(
  cors({
    origin: config.clientOrigins,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/api/health', async (_request, response) => {
  const db = await testDatabaseConnection();

  response.json({
    ok: true,
    serverTime: Date.now(),
    db,
  });
});

app.post('/api/rooms', async (request, response) => {
  try {
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
  } catch (error) {
    handleHttpError(response, error);
  }
});

app.post('/api/rooms/:roomCode/players', async (request, response) => {
  try {
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
  } catch (error) {
    handleHttpError(response, error);
  }
});

app.post('/api/rooms/:roomCode/start', async (request, response) => {
  try {
    const state = await orchestrator.startRoom(request.params.roomCode);

    response.json({
      ok: true,
      state,
    });
  } catch (error) {
    handleHttpError(response, error);
  }
});

app.get('/api/rooms/:roomCode/state', async (request, response) => {
  try {
    const state = await orchestrator.getState(request.params.roomCode, {
      role: request.query.role ?? 'spectator',
      playerId: request.query.playerId ? Number(request.query.playerId) : null,
    });

    response.json({
      ok: true,
      state,
    });
  } catch (error) {
    handleHttpError(response, error);
  }
});

io.on('connection', (socket) => {
  socket.on('room:watch', async (payload, callback) => {
    try {
      const state = await orchestrator.watchRoom(socket, payload ?? {});
      respond(callback, { ok: true, state });
    } catch (error) {
      respond(callback, { ok: false, error: error.message });
    }
  });

  socket.on('answer:submit', async (payload, callback) => {
    try {
      const result = await orchestrator.submitAnswer(payload ?? {});
      respond(callback, { ok: true, result });
    } catch (error) {
      respond(callback, { ok: false, error: error.message });
    }
  });

  socket.on('disconnect', async () => {
    try {
      await orchestrator.handleDisconnect(socket.id);
    } catch (error) {
      console.error(`[socket:disconnect:${socket.id}]`, error);
    }
  });
});

httpServer.listen(config.port, () => {
  console.log(`Enigma backend listening on http://localhost:${config.port}`);
});
