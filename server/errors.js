export class AppError extends Error {
  constructor(message, { statusCode = 500, code = 'INTERNAL_ERROR', details = null } = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function createHttpError(statusCode, message, code, details = null) {
  return new AppError(message, {
    statusCode,
    code,
    details,
  });
}

function mapKnownMessageToError(error) {
  const message = error?.message ?? 'Une erreur interne est survenue.';

  const mappings = [
    ['Room introuvable.', 404, 'ROOM_NOT_FOUND'],
    ['Le pseudo joueur est obligatoire.', 400, 'PLAYER_NICKNAME_REQUIRED'],
    ['Le nombre maximum de joueurs doit etre compris entre 1 et 8.', 400, 'INVALID_MAX_PLAYERS'],
    ['La reponse choisie est invalide pour cette question.', 400, 'INVALID_CHOICE'],
    ['Impossible de generer un code room unique.', 500, 'ROOM_CODE_GENERATION_FAILED'],
    ['Ce pseudo est deja pris dans cette room.', 409, 'PLAYER_NICKNAME_CONFLICT'],
    ['La room a atteint le nombre maximum de joueurs.', 409, 'ROOM_IS_FULL'],
    ['La partie a deja commence dans cette room.', 409, 'ROOM_ALREADY_STARTED'],
    ['La room est deja lancee.', 409, 'ROOM_ALREADY_RUNNING'],
    ['Impossible de lancer une partie sans joueur.', 409, 'ROOM_HAS_NO_PLAYERS'],
    ['Une seule reponse est autorisee par question.', 409, 'ANSWER_ALREADY_SUBMITTED'],
    ['La room n est pas en phase de reponse.', 409, 'ROOM_NOT_ACCEPTING_ANSWERS'],
    ['Ce joueur est elimine et ne peut plus repondre.', 409, 'PLAYER_ELIMINATED'],
    ['Le joueur est introuvable dans cette room.', 404, 'PLAYER_NOT_FOUND'],
    ['Le joueur demande est introuvable dans cette room.', 404, 'PLAYER_NOT_FOUND'],
    ['Un playerId est requis pour souscrire en tant que joueur.', 400, 'PLAYER_ID_REQUIRED'],
    ['Aucune question active trouvee pour cette room.', 409, 'NO_ACTIVE_QUESTION'],
    ['Impossible de finaliser une question introuvable.', 409, 'QUESTION_NOT_FOUND'],
    ['Aucune question jouable avec 4 reponses A/B/C/D n est disponible en base.', 422, 'NO_PLAYABLE_QUESTIONS'],
  ];

  for (const [knownMessage, statusCode, code] of mappings) {
    if (message === knownMessage) {
      return createHttpError(statusCode, message, code);
    }
  }

  if (error?.code === 'ER_DUP_ENTRY') {
    return createHttpError(409, message, 'DUPLICATE_ENTRY');
  }

  return createHttpError(500, message, 'INTERNAL_ERROR');
}

export function normalizeError(error) {
  if (error instanceof AppError) {
    return error;
  }

  return mapKnownMessageToError(error);
}

export function notFoundHandler(_request, _response, next) {
  next(createHttpError(404, 'Route introuvable.', 'ROUTE_NOT_FOUND'));
}

export function errorHandler(error, request, response, next) {
  void next;
  const normalized = normalizeError(error);
  const requestId = response.locals.requestId ?? 'unknown';

  if (normalized.statusCode >= 500 && normalized.code === 'INTERNAL_ERROR') {
    console.error(`[${requestId}]`, normalized);
  }

  response.status(normalized.statusCode).json({
    ok: false,
    error: normalized.message,
    code: normalized.code,
    requestId,
    details: normalized.details,
  });
}
