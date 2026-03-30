import {
  bindSocketToPlayer,
  clearSocket,
  createPlayer,
  createRoom,
  eliminatePlayer,
  ensureQuestionCycle,
  finishRoom,
  getNextRoomQuestion,
  getPlayerAnswer,
  getPlayerById,
  getQuestionById,
  getRoomByCode,
  insertPlayerAnswer,
  launchQuestion,
  listAnswersForQuestion,
  listPlayers,
  markWinner,
  moveToRevealPhase,
  saveQuestionResults,
} from '../repositories/gameRepository.js';

function normalizeRoomCode(roomCode) {
  return String(roomCode ?? '').trim().toUpperCase();
}

function normalizeTextAnswer(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function buildQuestionPayload(question, phase) {
  if (!question) {
    return null;
  }

  const revealMode = phase === 'answer_reveal' || phase === 'finished';

  return {
    id: question.id,
    title: question.title,
    text: question.text,
    type: question.questionType,
    mediaType: question.mediaType,
    mediaPath: question.mediaPath,
    explanation: revealMode ? question.explanation : null,
    correctText: revealMode ? question.correctText : null,
    answerTimeSeconds: question.answerTimeSeconds,
    revealTimeSeconds: question.revealTimeSeconds,
    choices: question.choices.map((choice) => ({
      id: choice.id,
      label: choice.label,
      text: choice.text,
      isCorrect: revealMode ? choice.isCorrect : undefined,
    })),
  };
}

function computePoints(question, responseTimeMs) {
  const maxDurationMs = question.answerTimeSeconds * 1000;
  const boundedResponse = Math.min(Math.max(responseTimeMs, 0), maxDurationMs);
  const speedRatio = maxDurationMs === 0 ? 0 : (maxDurationMs - boundedResponse) / maxDurationMs;
  const speedBonus = Math.round(question.basePoints * speedRatio);

  return question.basePoints + speedBonus;
}

function computeAverageResponse(previousAverage, answeredCount, responseTimeMs) {
  if (responseTimeMs == null) {
    return previousAverage ?? null;
  }

  if (!answeredCount || previousAverage == null) {
    return responseTimeMs;
  }

  return Math.round(
    ((previousAverage * answeredCount) + responseTimeMs) / (answeredCount + 1),
  );
}

function chooseEliminationCandidate(players) {
  return [...players].sort((left, right) => {
    if (left.score !== right.score) {
      return left.score - right.score;
    }

    if (left.correctAnswers !== right.correctAnswers) {
      return left.correctAnswers - right.correctAnswers;
    }

    return new Date(right.joinedAt).getTime() - new Date(left.joinedAt).getTime();
  })[0];
}

function chooseWinner(players) {
  return [...players].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.correctAnswers !== left.correctAnswers) {
      return right.correctAnswers - left.correctAnswers;
    }

    return new Date(left.joinedAt).getTime() - new Date(right.joinedAt).getTime();
  })[0];
}

function getCorrectChoice(question) {
  return question.choices.find((choice) => choice.isCorrect) ?? null;
}

function evaluateAnswer(question, payload) {
  const correctChoice = getCorrectChoice(question);

  if (question.questionType === 'text_hole') {
    const submitted = normalizeTextAnswer(payload.typedAnswer);
    const expected = normalizeTextAnswer(question.correctText);

    return {
      isCorrect: Boolean(submitted) && submitted === expected,
      typedAnswer: payload.typedAnswer ?? null,
      choiceId: null,
    };
  }

  const selectedChoice = question.choices.find((choice) => choice.id === Number(payload.choiceId));

  if (!selectedChoice) {
    throw new Error('La reponse choisie est invalide pour cette question.');
  }

  return {
    isCorrect: Boolean(correctChoice && selectedChoice.id === correctChoice.id),
    typedAnswer: null,
    choiceId: selectedChoice.id,
  };
}

export class GameOrchestrator {
  constructor(io) {
    this.io = io;
    this.roomRuntimes = new Map();
    this.socketSessions = new Map();
  }

  getRuntime(roomCode) {
    const normalizedCode = normalizeRoomCode(roomCode);

    if (!this.roomRuntimes.has(normalizedCode)) {
      this.roomRuntimes.set(normalizedCode, {
        currentQuestionOrder: 0,
        currentRoomQuestionId: null,
        questionStartedAt: null,
        questionEndsAt: null,
        revealEndsAt: null,
        nextEliminationAt: null,
        questionTimeout: null,
        revealTimeout: null,
        eliminationInterval: null,
        lastReveal: null,
        lastElimination: null,
      });
    }

    return this.roomRuntimes.get(normalizedCode);
  }

  clearQuestionTimers(roomCode) {
    const runtime = this.getRuntime(roomCode);

    if (runtime.questionTimeout) {
      clearTimeout(runtime.questionTimeout);
      runtime.questionTimeout = null;
    }

    if (runtime.revealTimeout) {
      clearTimeout(runtime.revealTimeout);
      runtime.revealTimeout = null;
    }
  }

  clearAllRuntimeTimers(roomCode) {
    const runtime = this.getRuntime(roomCode);
    this.clearQuestionTimers(roomCode);

    if (runtime.eliminationInterval) {
      clearInterval(runtime.eliminationInterval);
      runtime.eliminationInterval = null;
    }
  }

  async requireRoom(roomCode) {
    const room = await getRoomByCode(normalizeRoomCode(roomCode));

    if (!room) {
      throw new Error('Room introuvable.');
    }

    return room;
  }

  async createRoom(payload) {
    const room = await createRoom(payload);
    this.getRuntime(room.roomCode);

    return {
      room,
      state: await this.getState(room.roomCode),
    };
  }

  async joinRoom(roomCode, nickname) {
    const room = await this.requireRoom(roomCode);

    if (!String(nickname ?? '').trim()) {
      throw new Error('Le pseudo joueur est obligatoire.');
    }

    if (room.status !== 'lobby') {
      throw new Error('La partie a deja commence dans cette room.');
    }

    const players = await listPlayers(room.id);

    if (players.length >= room.maxPlayers) {
      throw new Error('La room a atteint le nombre maximum de joueurs.');
    }

    const player = await createPlayer({
      roomId: room.id,
      nickname: String(nickname).trim(),
    });

    await this.broadcastState(room.roomCode);

    return {
      room,
      player,
      state: await this.getState(room.roomCode, { role: 'player', playerId: player.id }),
    };
  }

  async watchRoom(socket, { roomCode, role = 'spectator', playerId = null }) {
    const room = await this.requireRoom(roomCode);
    const normalizedCode = room.roomCode;

    await socket.join(`room:${normalizedCode}`);

    if (role === 'player') {
      if (!playerId) {
        throw new Error('Un playerId est requis pour souscrire en tant que joueur.');
      }

      const player = await getPlayerById(playerId);

      if (!player || player.roomId !== room.id) {
        throw new Error('Le joueur demande est introuvable dans cette room.');
      }

      await bindSocketToPlayer(player.id, socket.id);
      this.socketSessions.set(socket.id, {
        roomCode: normalizedCode,
        role: 'player',
        playerId: player.id,
      });
    } else {
      this.socketSessions.set(socket.id, {
        roomCode: normalizedCode,
        role,
        playerId: null,
      });
    }

    const state = await this.getState(normalizedCode, {
      role,
      playerId,
    });

    socket.emit('room:state', state);

    return state;
  }

  async handleDisconnect(socketId) {
    const session = this.socketSessions.get(socketId);

    if (!session) {
      return;
    }

    this.socketSessions.delete(socketId);

    if (session.playerId) {
      await clearSocket(socketId);
      await this.broadcastState(session.roomCode);
    }
  }

  async startRoom(roomCode) {
    const room = await this.requireRoom(roomCode);
    const players = await listPlayers(room.id);

    if (!players.length) {
      throw new Error('Impossible de lancer une partie sans joueur.');
    }

    if (room.status !== 'lobby') {
      throw new Error('La room est deja lancee.');
    }

    await ensureQuestionCycle(room);

    const runtime = this.getRuntime(room.roomCode);
    runtime.nextEliminationAt = Date.now() + (room.eliminationIntervalSeconds * 1000);
    runtime.lastElimination = null;

    await this.launchNextQuestion(room.roomCode);

    runtime.eliminationInterval = setInterval(async () => {
      try {
        await this.runElimination(room.roomCode);
      } catch (error) {
        console.error(`[elimination:${room.roomCode}]`, error);
      }
    }, room.eliminationIntervalSeconds * 1000);

    return this.getState(room.roomCode);
  }

  async launchNextQuestion(roomCode) {
    const room = await this.requireRoom(roomCode);
    const runtime = this.getRuntime(room.roomCode);
    const next = await getNextRoomQuestion(room, runtime.currentQuestionOrder);

    runtime.currentQuestionOrder = next.questionOrder;
    runtime.currentRoomQuestionId = next.roomQuestionId;
    runtime.questionStartedAt = Date.now();
    runtime.questionEndsAt = runtime.questionStartedAt + (next.question.answerTimeSeconds * 1000);
    runtime.revealEndsAt = null;
    runtime.lastReveal = null;

    await launchQuestion(room.id, next.roomQuestionId, next.question.id);

    this.clearQuestionTimers(room.roomCode);
    runtime.questionTimeout = setTimeout(async () => {
      try {
        await this.endCurrentQuestion(room.roomCode);
      } catch (error) {
        console.error(`[question:end:${room.roomCode}]`, error);
      }
    }, next.question.answerTimeSeconds * 1000);

    await this.broadcastState(room.roomCode);
  }

  async submitAnswer({ roomCode, playerId, choiceId, typedAnswer }) {
    const room = await this.requireRoom(roomCode);
    const runtime = this.getRuntime(room.roomCode);

    if (room.status !== 'in_progress' || room.currentPhase !== 'question_live') {
      throw new Error('La room n est pas en phase de reponse.');
    }

    const player = await getPlayerById(playerId);

    if (!player || player.roomId !== room.id) {
      throw new Error('Le joueur est introuvable dans cette room.');
    }

    if (player.status !== 'alive') {
      throw new Error('Ce joueur est elimine et ne peut plus repondre.');
    }

    const currentQuestion = await getQuestionById(room.currentQuestionId);

    if (!currentQuestion) {
      throw new Error('Aucune question active trouvee pour cette room.');
    }

    const existingAnswer = await getPlayerAnswer(player.id, currentQuestion.id);

    if (existingAnswer) {
      throw new Error('Une seule reponse est autorisee par question.');
    }

    const evaluation = evaluateAnswer(currentQuestion, { choiceId, typedAnswer });
    const responseTimeMs = Math.max(Date.now() - runtime.questionStartedAt, 0);

    await insertPlayerAnswer({
      roomId: room.id,
      roomPlayerId: player.id,
      questionId: currentQuestion.id,
      choiceId: evaluation.choiceId,
      typedAnswer: evaluation.typedAnswer,
      isCorrect: evaluation.isCorrect,
      responseTimeMs,
    });

    await this.broadcastState(room.roomCode);

    return {
      accepted: true,
      responseTimeMs,
    };
  }

  async endCurrentQuestion(roomCode) {
    const room = await this.requireRoom(roomCode);
    const runtime = this.getRuntime(room.roomCode);
    const question = await getQuestionById(room.currentQuestionId);

    if (!question) {
      throw new Error('Impossible de finaliser une question introuvable.');
    }

    const players = await listPlayers(room.id);
    const answers = await listAnswersForQuestion(room.id, question.id);
    const answerByPlayerId = new Map(answers.map((answer) => [answer.roomPlayerId, answer]));
    const correctChoice = getCorrectChoice(question);

    const playerResults = players.map((player) => {
      const answer = answerByPlayerId.get(player.id);
      const answered = Boolean(answer);
      const isCorrect = Boolean(answer?.isCorrect);
      const pointsEarned = isCorrect ? computePoints(question, answer.responseTimeMs ?? 0) : 0;
      const nextScore = player.score + pointsEarned;
      const nextCorrectAnswers = player.correctAnswers + (isCorrect ? 1 : 0);
      const nextWrongAnswers = player.wrongAnswers + (isCorrect ? 0 : 1);
      const nextAverageResponseMs = answered
        ? computeAverageResponse(
            player.averageResponseMs,
            player.answeredCount,
            answer.responseTimeMs,
          )
        : player.averageResponseMs;

      return {
        roomPlayerId: player.id,
        answered,
        isCorrect,
        responseTimeMs: answer?.responseTimeMs ?? null,
        pointsEarned,
        nextScore,
        nextCorrectAnswers,
        nextWrongAnswers,
        nextAverageResponseMs,
      };
    });

    await saveQuestionResults({
      questionId: question.id,
      playerResults,
    });

    await moveToRevealPhase(room.id, runtime.currentRoomQuestionId);

    runtime.lastReveal = {
      questionId: question.id,
      correctChoiceId: correctChoice?.id ?? null,
      correctChoiceLabel: correctChoice?.label ?? null,
      correctChoiceText: correctChoice?.text ?? question.correctText ?? null,
      explanation: question.explanation,
    };
    runtime.revealEndsAt = Date.now() + (question.revealTimeSeconds * 1000);

    runtime.revealTimeout = setTimeout(async () => {
      try {
        await this.afterReveal(room.roomCode);
      } catch (error) {
        console.error(`[reveal:end:${room.roomCode}]`, error);
      }
    }, question.revealTimeSeconds * 1000);

    await this.broadcastState(room.roomCode);
  }

  async afterReveal(roomCode) {
    const room = await this.requireRoom(roomCode);
    const players = await listPlayers(room.id);
    const alivePlayers = players.filter((player) => player.status === 'alive');

    if (alivePlayers.length <= 1) {
      await this.finishGame(room.roomCode, players);
      return;
    }

    await this.launchNextQuestion(room.roomCode);
  }

  async runElimination(roomCode) {
    const room = await this.requireRoom(roomCode);

    if (room.status !== 'in_progress') {
      return;
    }

    const players = await listPlayers(room.id);
    const alivePlayers = players.filter((player) => player.status === 'alive');

    if (alivePlayers.length <= 1) {
      await this.finishGame(room.roomCode, players);
      return;
    }

    const eliminatedPlayer = chooseEliminationCandidate(alivePlayers);
    await eliminatePlayer(eliminatedPlayer.id, alivePlayers.length);

    const runtime = this.getRuntime(room.roomCode);
    runtime.lastElimination = {
      playerId: eliminatedPlayer.id,
      nickname: eliminatedPlayer.nickname,
      at: Date.now(),
    };
    runtime.nextEliminationAt = Date.now() + (room.eliminationIntervalSeconds * 1000);

    const updatedPlayers = await listPlayers(room.id);
    const updatedAlivePlayers = updatedPlayers.filter((player) => player.status === 'alive');

    if (updatedAlivePlayers.length <= 1) {
      await this.finishGame(room.roomCode, updatedPlayers);
      return;
    }

    await this.broadcastState(room.roomCode);
  }

  async finishGame(roomCode, existingPlayers = null) {
    const room = await this.requireRoom(roomCode);
    const players = existingPlayers ?? (await listPlayers(room.id));
    const winner = chooseWinner(players);

    if (winner && winner.status !== 'winner') {
      await markWinner(winner.id);
    }

    await finishRoom(room.id);
    this.clearAllRuntimeTimers(room.roomCode);

    const runtime = this.getRuntime(room.roomCode);
    runtime.questionEndsAt = null;
    runtime.revealEndsAt = null;
    runtime.nextEliminationAt = null;

    await this.broadcastState(room.roomCode);
  }

  async buildBaseState(roomCode) {
    const room = await this.requireRoom(roomCode);
    const runtime = this.getRuntime(room.roomCode);
    const players = await listPlayers(room.id);
    const currentQuestion = room.currentQuestionId
      ? await getQuestionById(room.currentQuestionId)
      : null;
    const currentAnswers = currentQuestion
      ? await listAnswersForQuestion(room.id, currentQuestion.id)
      : [];
    const answerByPlayerId = new Map(
      currentAnswers.map((answer) => [answer.roomPlayerId, answer]),
    );
    const playersById = new Map(players.map((player) => [player.id, player]));
    const aliveCount = players.filter((player) => player.status === 'alive').length;

    const leaderboard = [...players]
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (right.correctAnswers !== left.correctAnswers) {
          return right.correctAnswers - left.correctAnswers;
        }

        return new Date(left.joinedAt).getTime() - new Date(right.joinedAt).getTime();
      })
      .map((player, index) => ({
        id: player.id,
        nickname: player.nickname,
        score: player.score,
        correctAnswers: player.correctAnswers,
        wrongAnswers: player.wrongAnswers,
        averageResponseMs: player.averageResponseMs,
        status: player.status,
        connected: player.connected,
        finalRank: player.finalRank,
        eliminatedAt: player.eliminatedAt,
        rank: player.finalRank ?? index + 1,
      }));

    return {
      room,
      runtime,
      players,
      playersById,
      currentQuestion,
      currentAnswers,
      answerByPlayerId,
      leaderboard,
      aliveCount,
    };
  }

  toViewerState(baseState, viewer = { role: 'spectator', playerId: null }) {
    const player = viewer.playerId ? baseState.playersById.get(viewer.playerId) : null;
    const viewerAnswer = player
      ? baseState.answerByPlayerId.get(player.id) ?? null
      : null;

    return {
      room: {
        id: baseState.room.id,
        code: baseState.room.roomCode,
        hostName: baseState.room.hostName,
        status: baseState.room.status,
        phase: baseState.room.currentPhase,
        currentQuestionId: baseState.room.currentQuestionId,
        currentQuestionOrder: baseState.runtime.currentQuestionOrder,
        eliminationIntervalSeconds: baseState.room.eliminationIntervalSeconds,
        maxPlayers: baseState.room.maxPlayers,
        startedAt: baseState.room.startedAt,
        endedAt: baseState.room.endedAt,
        phaseEndsAt:
          baseState.room.currentPhase === 'question_live'
            ? baseState.runtime.questionEndsAt
            : baseState.room.currentPhase === 'answer_reveal'
              ? baseState.runtime.revealEndsAt
              : null,
        nextEliminationAt: baseState.runtime.nextEliminationAt,
      },
      question: buildQuestionPayload(
        baseState.currentQuestion,
        baseState.room.currentPhase,
      ),
      reveal: baseState.runtime.lastReveal,
      lastElimination: baseState.runtime.lastElimination,
      leaderboard: baseState.leaderboard,
      meta: {
        serverTime: Date.now(),
        totalPlayers: baseState.players.length,
        alivePlayers: baseState.aliveCount,
        answeredPlayers: baseState.currentAnswers.length,
      },
      viewer: {
        role: viewer.role ?? 'spectator',
        playerId: player?.id ?? null,
        nickname: player?.nickname ?? null,
        status: player?.status ?? null,
        score: player?.score ?? null,
        hasAnswered: Boolean(viewerAnswer),
        lastChoiceId: viewerAnswer?.choiceId ?? null,
        lastTypedAnswer: viewerAnswer?.typedAnswer ?? null,
      },
    };
  }

  async getState(roomCode, viewer) {
    const baseState = await this.buildBaseState(roomCode);
    return this.toViewerState(baseState, viewer);
  }

  async broadcastState(roomCode) {
    const normalizedCode = normalizeRoomCode(roomCode);
    const baseState = await this.buildBaseState(normalizedCode);

    for (const [socketId, session] of this.socketSessions.entries()) {
      if (session.roomCode !== normalizedCode) {
        continue;
      }

      const socket = this.io.sockets.sockets.get(socketId);

      if (!socket) {
        continue;
      }

      socket.emit(
        'room:state',
        this.toViewerState(baseState, {
          role: session.role,
          playerId: session.playerId,
        }),
      );
    }
  }
}
