# Qui a la réf ?

Backend temps reel MVP pour un quiz battle royale multijoueur.

## Stack backend

- `Node.js` + `Express`
- `Socket.IO`
- `MariaDB`

## Structure backend

- `server/app.js`
  Express pur, sans `listen`, reutilisable en local et en serverless
- `server/index.js`
  serveur HTTP local stateful avec Socket.IO
- `api/index.js`
  point d entree Vercel serverless
- `server/db.js`
  pool MariaDB et helpers `withConnection` / `withTransaction`
- `server/repositories/gameRepository.js`
  acces SQL
- `server/services/gameOrchestrator.js`
  moteur de partie stateful

## Variables d environnement

- `PORT`
- `CLIENT_ORIGIN`
- `ENIGMA_RUNTIME_MODE`
- `REQUEST_TIMEOUT_MS`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_CONNECTION_LIMIT`
- `DB_CONNECT_TIMEOUT_MS`
- `DB_ACQUIRE_TIMEOUT_MS`
- `DB_IDLE_TIMEOUT_SECONDS`
- `DEFAULT_ELIMINATION_INTERVAL_SECONDS`
- `DEFAULT_MAX_PLAYERS`

## Lancer le backend local stateful

1. Copier `.env.example` vers `.env`
2. Verifier l acces a la base `enigma`
3. Lancer `npm install`
4. Lancer `npm run dev:server`

Le serveur demarre par defaut sur `http://localhost:3001`.

## Endpoints REST

- `GET /api/health`
- `POST /api/rooms`
- `POST /api/rooms/:roomCode/players`
- `POST /api/rooms/:roomCode/start`
- `GET /api/rooms/:roomCode/state`

## Evenements Socket.IO

- `room:watch`
  Payload: `{ roomCode, role, playerId? }`
- `answer:submit`
  Payload QCM: `{ roomCode, playerId, choiceId }`
  Payload texte: `{ roomCode, playerId, typedAnswer }`
- `room:state`
  Emis par le serveur a chaque transition importante

## Vercel

Le fichier `vercel.json` route tout `/api/*` vers `api/index.js`.

Important:

- le mode serverless Vercel expose correctement l API HTTP
- le moteur de partie temps reel actuel n est pas fiable sur Vercel Functions
- raison 1: Socket.IO n est pas adapte a ce runtime stateless
- raison 2: `GameOrchestrator` utilise des timers et un etat en memoire (`roomRuntimes`)

Conclusion production:

- Vercel peut heberger le front
- le backend temps reel stateful doit rester sur un serveur Node dedie, ou etre remplace par un service temps reel externe

## Alternatives stables pour le temps reel

- serveur Node dedie hors Vercel pour REST + Socket.IO + timers
- Pusher / Ably / Supabase Realtime pour le transport temps reel
- moteur de jeu et scheduler externalises dans un worker persistant

## Notes de fiabilite

- le pool MariaDB est singleton et reutilise en module scope
- `withConnection` relache toujours la connexion
- `withTransaction` fait `rollback` en cas d erreur
- les routes HTTP sont protegees par un timeout applicatif
- les erreurs retournent toujours du JSON via le middleware global
