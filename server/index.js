import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config.js';
import { GameOrchestrator } from './services/gameOrchestrator.js';
import { registerSocketHandlers } from './socketHandlers.js';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: config.clientOrigins,
    credentials: true,
  },
});

const orchestrator = new GameOrchestrator(io);
const app = createApp({
  orchestrator,
  capabilities: {
    runtimeMode: 'persistent',
    realtime: true,
    statefulGameEngine: true,
  },
});

registerSocketHandlers(io, orchestrator);

httpServer.on('request', app);
httpServer.requestTimeout = config.http.requestTimeoutMs;
httpServer.headersTimeout = config.http.requestTimeoutMs + 1000;

process.on('unhandledRejection', (error) => {
  console.error('[unhandledRejection]', error);
});

process.on('uncaughtException', (error) => {
  console.error('[uncaughtException]', error);
});

httpServer.listen(config.port, () => {
  console.log(`Qui a la réf ? backend listening on http://localhost:${config.port}`);
});
