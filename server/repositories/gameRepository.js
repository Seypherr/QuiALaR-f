import { withConnection, withTransaction } from '../db.js';
import { config } from '../config.js';

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function createRoomCodeCandidate(length = 6) {
  return Array.from({ length }, () => {
    const index = Math.floor(Math.random() * ROOM_CODE_ALPHABET.length);
    return ROOM_CODE_ALPHABET[index];
  }).join('');
}

async function generateUniqueRoomCode(connection) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const roomCode = createRoomCodeCandidate();
    const existing = await connection.query(
      'SELECT id FROM rooms WHERE room_code = ? LIMIT 1',
      [roomCode],
    );

    if (!existing[0]) {
      return roomCode;
    }
  }

  throw new Error('Impossible de generer un code room unique.');
}

function mapRoom(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    roomCode: row.room_code,
    hostName: row.host_name,
    themeId: row.theme_id,
    status: row.status,
    currentQuestionId: row.current_question_id,
    currentPhase: row.current_phase,
    eliminationIntervalSeconds: row.elimination_interval_seconds,
    maxPlayers: row.max_players,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPlayer(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    nickname: row.nickname,
    socketId: row.socket_id,
    score: row.score,
    correctAnswers: row.correct_answers,
    wrongAnswers: row.wrong_answers,
    averageResponseMs: row.average_response_ms,
    answeredCount: row.answered_count ?? 0,
    status: row.status,
    isActive: Boolean(row.is_active),
    connected: Boolean(row.socket_id),
    eliminatedAt: row.eliminated_at,
    finalRank: row.final_rank,
    joinedAt: row.joined_at,
    updatedAt: row.updated_at,
  };
}

function mapChoice(row) {
  return {
    id: row.id,
    questionId: row.question_id,
    label: row.label,
    text: row.choice_text,
    order: row.choice_order,
    isCorrect: Boolean(row.is_correct),
  };
}

function mapQuestion(row, choices) {
  return {
    id: row.id,
    themeId: row.theme_id,
    questionType: row.question_type,
    title: row.title,
    text: row.question_text,
    mediaType: row.media_type,
    mediaPath: row.media_path,
    correctText: row.correct_text,
    explanation: row.explanation,
    difficulty: row.difficulty,
    basePoints: row.base_points,
    answerTimeSeconds: row.answer_time_seconds,
    revealTimeSeconds: row.reveal_time_seconds,
    choices,
  };
}

function mapAnswer(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    roomPlayerId: row.room_player_id,
    questionId: row.question_id,
    choiceId: row.choice_id,
    typedAnswer: row.typed_answer,
    isCorrect: Boolean(row.is_correct),
    pointsEarned: row.points_earned,
    responseTimeMs: row.response_time_ms,
    answeredAt: row.answered_at,
  };
}

async function appendQuestionCycle(connection, roomId, themeId, startOrder) {
  const params = [];
  let sql = 'SELECT id FROM questions WHERE is_active = 1';

  if (themeId) {
    sql += ' AND theme_id = ?';
    params.push(themeId);
  }

  sql += ' ORDER BY id ASC';

  let questions = await connection.query(sql, params);

  if (!questions.length && themeId) {
    questions = await connection.query(
      'SELECT id FROM questions WHERE is_active = 1 ORDER BY id ASC',
    );
  }

  if (!questions.length) {
    throw new Error('Aucune question active disponible en base.');
  }

  for (const [index, question] of questions.entries()) {
    await connection.query(
      `INSERT INTO room_questions (room_id, question_id, question_order)
       VALUES (?, ?, ?)`,
      [roomId, question.id, startOrder + index],
    );
  }
}

export async function createRoom({
  hostName,
  themeId = null,
  eliminationIntervalSeconds = config.game.defaultEliminationIntervalSeconds,
  maxPlayers = config.game.defaultMaxPlayers,
}) {
  return withTransaction(async (connection) => {
    const roomCode = await generateUniqueRoomCode(connection);
    const result = await connection.query(
      `INSERT INTO rooms (
        room_code,
        host_name,
        theme_id,
        elimination_interval_seconds,
        max_players
      ) VALUES (?, ?, ?, ?, ?)`,
      [roomCode, hostName ?? null, themeId, eliminationIntervalSeconds, maxPlayers],
    );

    const rows = await connection.query(
      'SELECT * FROM rooms WHERE id = ? LIMIT 1',
      [result.insertId],
    );

    return mapRoom(rows[0]);
  });
}

export async function getRoomByCode(roomCode) {
  return withConnection(async (connection) => {
    const rows = await connection.query(
      'SELECT * FROM rooms WHERE room_code = ? LIMIT 1',
      [String(roomCode).toUpperCase()],
    );

    return mapRoom(rows[0]);
  });
}

export async function listPlayers(roomId) {
  return withConnection(async (connection) => {
    const rows = await connection.query(
      `SELECT
         rp.*,
         COALESCE(answer_stats.answered_count, 0) AS answered_count
       FROM room_players rp
       LEFT JOIN (
         SELECT room_player_id, COUNT(*) AS answered_count
         FROM player_answers
         WHERE room_id = ?
         GROUP BY room_player_id
       ) AS answer_stats ON answer_stats.room_player_id = rp.id
       WHERE rp.room_id = ?
       ORDER BY rp.score DESC, rp.correct_answers DESC, rp.joined_at ASC`,
      [roomId, roomId],
    );

    return rows.map(mapPlayer);
  });
}

export async function getPlayerById(playerId) {
  return withConnection(async (connection) => {
    const rows = await connection.query(
      `SELECT
         rp.*,
         COALESCE(answer_stats.answered_count, 0) AS answered_count
       FROM room_players rp
       LEFT JOIN (
         SELECT room_player_id, COUNT(*) AS answered_count
         FROM player_answers
         WHERE room_player_id = ?
         GROUP BY room_player_id
       ) AS answer_stats ON answer_stats.room_player_id = rp.id
       WHERE rp.id = ?
       LIMIT 1`,
      [playerId, playerId],
    );

    return rows[0] ? mapPlayer(rows[0]) : null;
  });
}

export async function createPlayer({ roomId, nickname }) {
  return withTransaction(async (connection) => {
    try {
      const result = await connection.query(
        `INSERT INTO room_players (room_id, nickname)
         VALUES (?, ?)`,
        [roomId, nickname],
      );

      const rows = await connection.query(
        'SELECT * FROM room_players WHERE id = ? LIMIT 1',
        [result.insertId],
      );

      return mapPlayer({ ...rows[0], answered_count: 0 });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ce pseudo est deja pris dans cette room.');
      }

      throw error;
    }
  });
}

export async function bindSocketToPlayer(playerId, socketId) {
  return withTransaction(async (connection) => {
    await connection.query(
      'UPDATE room_players SET socket_id = NULL WHERE socket_id = ?',
      [socketId],
    );

    await connection.query(
      'UPDATE room_players SET socket_id = ?, is_active = 1 WHERE id = ?',
      [socketId, playerId],
    );
  });
}

export async function clearSocket(socketId) {
  return withConnection(async (connection) =>
    connection.query(
      'UPDATE room_players SET socket_id = NULL WHERE socket_id = ?',
      [socketId],
    ));
}

export async function ensureQuestionCycle(room) {
  return withTransaction(async (connection) => {
    const rows = await connection.query(
      'SELECT COALESCE(MAX(question_order), 0) AS max_order FROM room_questions WHERE room_id = ?',
      [room.id],
    );

    if (rows[0]?.max_order > 0) {
      return;
    }

    await appendQuestionCycle(connection, room.id, room.themeId, 1);
  });
}

export async function getQuestionById(questionId, existingConnection = null) {
  const load = async (connection) => {
    const questionRows = await connection.query(
      `SELECT
         q.*,
         qt.code AS question_type
       FROM questions q
       JOIN question_types qt ON qt.id = q.question_type_id
       WHERE q.id = ?
       LIMIT 1`,
      [questionId],
    );

    const choiceRows = await connection.query(
      `SELECT *
       FROM choices
       WHERE question_id = ?
       ORDER BY choice_order ASC, id ASC`,
      [questionId],
    );

    if (!questionRows[0]) {
      return null;
    }

    return mapQuestion(questionRows[0], choiceRows.map(mapChoice));
  };

  if (existingConnection) {
    return load(existingConnection);
  }

  return withConnection(load);
}

export async function getNextRoomQuestion(room, currentOrder = 0) {
  return withTransaction(async (connection) => {
    let rows = await connection.query(
      `SELECT id, question_id, question_order
       FROM room_questions
       WHERE room_id = ? AND question_order > ?
       ORDER BY question_order ASC
       LIMIT 1`,
      [room.id, currentOrder],
    );

    if (!rows[0]) {
      const maxRows = await connection.query(
        'SELECT COALESCE(MAX(question_order), 0) AS max_order FROM room_questions WHERE room_id = ?',
        [room.id],
      );

      await appendQuestionCycle(
        connection,
        room.id,
        room.themeId,
        (maxRows[0]?.max_order ?? 0) + 1,
      );

      rows = await connection.query(
        `SELECT id, question_id, question_order
         FROM room_questions
         WHERE room_id = ? AND question_order > ?
         ORDER BY question_order ASC
         LIMIT 1`,
        [room.id, currentOrder],
      );
    }

    const next = rows[0];
    const question = await getQuestionById(next.question_id, connection);

    return {
      roomQuestionId: next.id,
      questionOrder: next.question_order,
      question,
    };
  });
}

export async function launchQuestion(roomId, roomQuestionId, questionId) {
  return withTransaction(async (connection) => {
    await connection.query(
      `UPDATE rooms
       SET status = 'in_progress',
           current_phase = 'question_live',
           current_question_id = ?,
           started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
       WHERE id = ?`,
      [questionId, roomId],
    );

    await connection.query(
      `UPDATE room_questions
       SET asked_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [roomQuestionId],
    );
  });
}

export async function moveToRevealPhase(roomId, roomQuestionId) {
  return withTransaction(async (connection) => {
    await connection.query(
      `UPDATE rooms
       SET current_phase = 'answer_reveal'
       WHERE id = ?`,
      [roomId],
    );

    await connection.query(
      `UPDATE room_questions
       SET revealed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [roomQuestionId],
    );
  });
}

export async function getPlayerAnswer(roomPlayerId, questionId) {
  return withConnection(async (connection) => {
    const rows = await connection.query(
      `SELECT *
       FROM player_answers
       WHERE room_player_id = ? AND question_id = ?
       LIMIT 1`,
      [roomPlayerId, questionId],
    );

    return rows[0] ? mapAnswer(rows[0]) : null;
  });
}

export async function insertPlayerAnswer({
  roomId,
  roomPlayerId,
  questionId,
  choiceId = null,
  typedAnswer = null,
  isCorrect,
  responseTimeMs,
}) {
  return withTransaction(async (connection) => {
    const existing = await connection.query(
      `SELECT id
       FROM player_answers
       WHERE room_player_id = ? AND question_id = ?
       LIMIT 1`,
      [roomPlayerId, questionId],
    );

    if (existing[0]) {
      throw new Error('Une seule reponse est autorisee par question.');
    }

    await connection.query(
      `INSERT INTO player_answers (
         room_id,
         room_player_id,
         question_id,
         choice_id,
         typed_answer,
         is_correct,
         points_earned,
         response_time_ms
       ) VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        roomId,
        roomPlayerId,
        questionId,
        choiceId,
        typedAnswer,
        isCorrect ? 1 : 0,
        responseTimeMs,
      ],
    );
  });
}

export async function listAnswersForQuestion(roomId, questionId) {
  return withConnection(async (connection) => {
    const rows = await connection.query(
      `SELECT *
       FROM player_answers
       WHERE room_id = ? AND question_id = ?
       ORDER BY answered_at ASC`,
      [roomId, questionId],
    );

    return rows.map(mapAnswer);
  });
}

export async function saveQuestionResults({ questionId, playerResults }) {
  return withTransaction(async (connection) => {
    for (const result of playerResults) {
      await connection.query(
        `UPDATE room_players
         SET score = ?,
             correct_answers = ?,
             wrong_answers = ?,
             average_response_ms = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          result.nextScore,
          result.nextCorrectAnswers,
          result.nextWrongAnswers,
          result.nextAverageResponseMs,
          result.roomPlayerId,
        ],
      );

      if (result.answered) {
        await connection.query(
          `UPDATE player_answers
           SET is_correct = ?,
               points_earned = ?,
               response_time_ms = ?
           WHERE room_player_id = ? AND question_id = ?`,
          [
            result.isCorrect ? 1 : 0,
            result.pointsEarned,
            result.responseTimeMs,
            result.roomPlayerId,
            questionId,
          ],
        );
      }
    }
  });
}

export async function eliminatePlayer(playerId, finalRank) {
  return withConnection(async (connection) =>
    connection.query(
      `UPDATE room_players
       SET status = 'eliminated',
           is_active = 0,
           eliminated_at = CURRENT_TIMESTAMP,
           final_rank = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'alive'`,
      [finalRank, playerId],
    ));
}

export async function markWinner(playerId) {
  return withConnection(async (connection) =>
    connection.query(
      `UPDATE room_players
       SET status = 'winner',
           is_active = 1,
           final_rank = 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [playerId],
    ));
}

export async function finishRoom(roomId) {
  return withConnection(async (connection) =>
    connection.query(
      `UPDATE rooms
       SET status = 'finished',
           current_phase = 'finished',
           ended_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [roomId],
    ));
}
