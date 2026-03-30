# Enigma

Backend temps reel MVP pour un quiz battle royale multijoueur.

## Stack backend

- `Node.js` + `Express`
- `Socket.IO`
- `MariaDB`

## Lancer le backend

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

## Regles implementees

- creation de room
- join joueur
- cycle `question_live -> answer_reveal`
- calcul de score cote serveur
- leaderboard temps reel
- elimination automatique toutes les `120s` par defaut
- joueur elimine conserve dans le leaderboard
- dernier joueur vivant declare gagnant

## Notes d integration front

- Le serveur est la seule source de verite pour les phases, scores, eliminations et timers
- Le front peut faire la creation/join/start en REST, puis se brancher en Socket.IO via `room:watch`
- La question courante et le leaderboard sont exposes dans `room:state`
