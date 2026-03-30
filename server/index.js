import { createServer } from 'node:http';
import { createApp } from './app.js';
import { config } from './config.js';
import { GameOrchestrator } from './services/gameOrchestrator.js';

const orchestrator = new GameOrchestrator();
const app = createApp({ orchestrator });
const httpServer = createServer(app);

httpServer.requestTimeout = config.http.requestTimeoutMs;
httpServer.headersTimeout = config.http.requestTimeoutMs + 1000;

process.on('unhandledRejection', (error) => {
  console.error('[unhandledRejection]', error);
});

process.on('uncaughtException', (error) => {
  console.error('[uncaughtException]', error);
});

httpServer.listen(config.port, () => {
  console.log(`Qui a la ref ? backend listening on http://localhost:${config.port}`);
});
