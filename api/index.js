import { createApp } from '../server/app.js';
import { config } from '../server/config.js';
import { createNoopIo } from '../server/noopIo.js';
import { GameOrchestrator } from '../server/services/gameOrchestrator.js';

const orchestrator = new GameOrchestrator(createNoopIo());
const app = createApp({
  orchestrator,
  capabilities: {
    runtimeMode: config.runtimeMode,
    realtime: false,
    statefulGameEngine: false,
  },
});

export default function handler(request, response) {
  return app(request, response);
}
