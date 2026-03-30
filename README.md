# Qui a la ref ?

MVP de quiz battle royale compatible Vercel.

## Stack

- Front React + Vite
- API Express serverless-friendly
- Base Turso / libSQL
- Temps reel par polling HTTP

## Principe d architecture

- Le serveur reste l unique source de verite pour les scores, timers, corrections et eliminations.
- Aucune room ne vit en memoire. Les transitions sont recalculées a partir des timestamps en base.
- Le front interroge `GET /api/rooms/:roomCode/state` a intervalle regulier.

## Fichiers cles

- `api/index.js`
  point d entree Vercel
- `server/app.js`
  app Express pure sans `listen`
- `server/index.js`
  serveur local de dev
- `server/db.js`
  client Turso / libSQL + bootstrap
- `server/repositories/gameRepository.js`
  acces SQL compatible SQLite/libSQL
- `server/services/gameOrchestrator.js`
  moteur de partie stateless
- `database/turso-schema.sql`
  schema SQLite/libSQL
- `database/turso-seed.sql`
  seed SQLite/libSQL

## Variables d environnement

Backend:

- `PORT`
- `CLIENT_ORIGIN`
- `ENIGMA_RUNTIME_MODE`
- `REQUEST_TIMEOUT_MS`
- `POLLING_INTERVAL_MS`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `TURSO_BOOTSTRAP_ON_START`
- `DEFAULT_ELIMINATION_INTERVAL_SECONDS`
- `DEFAULT_MAX_PLAYERS`

Front:

- `VITE_API_URL`
- `VITE_POLLING_INTERVAL_MS`

Voir [.env.example](C:\Users\eporc\Documents\GitHub\Challenge-48H-G6\.env.example).

## Lancement local

1. Copier `.env.example` vers `.env`
2. Installer les dependances:

```bash
npm install
```

3. Initialiser la base locale:

```bash
npm run db:bootstrap
```

4. Lancer le backend:

```bash
npm run dev:server
```

5. Lancer le front:

```bash
npm run dev
```

Le backend tourne par defaut sur `http://localhost:3001`.

## Endpoints REST

- `GET /api/health`
- `POST /api/rooms`
- `POST /api/rooms/:roomCode/players`
- `POST /api/rooms/:roomCode/start`
- `POST /api/rooms/:roomCode/answers`
- `GET /api/rooms/:roomCode/state`

## Regles MVP prises en charge

- room limitee a 8 joueurs
- questions jouables limitees aux QCM avec 4 reponses `A`, `B`, `C`, `D`
- cycle `question_live -> answer_reveal`
- leaderboard toujours visible
- elimination automatique toutes les 120 secondes
- joueurs elimines conserves dans le classement
- dernier joueur vivant declare gagnant

## Deploiement Vercel + Turso

1. Creer une base Turso.
2. Importer `database/turso-schema.sql` puis `database/turso-seed.sql` dans cette base avec le shell Turso ou votre client SQL habituel.

3. Ajouter sur Vercel:

```env
CLIENT_ORIGIN=https://votre-front.vercel.app
ENIGMA_RUNTIME_MODE=serverless
REQUEST_TIMEOUT_MS=10000
POLLING_INTERVAL_MS=1000
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
DEFAULT_ELIMINATION_INTERVAL_SECONDS=120
DEFAULT_MAX_PLAYERS=8
VITE_API_URL=https://votre-front.vercel.app
VITE_POLLING_INTERVAL_MS=1000
```

4. Redeployer.

Le fichier [vercel.json](C:\Users\eporc\Documents\GitHub\Challenge-48H-G6\vercel.json) route deja `/api/*` vers `api/index.js`.
