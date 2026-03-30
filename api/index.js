import { createApp } from '../server/app.js';
import { GameOrchestrator } from '../server/services/gameOrchestrator.js';

const orchestrator = new GameOrchestrator();
const app = createApp({ orchestrator });

export default function handler(request, response) {
  return app(request, response);
}
