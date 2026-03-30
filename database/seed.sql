USE enigma;

-- QUESTION TYPES
INSERT INTO question_types (code, name) VALUES
('qcm', 'QCM'),
('media', 'Question média'),
('text_hole', 'Texte à trous');

-- EFFECTS
INSERT INTO effects (code, name, description, effect_type, value_int) VALUES
('NONE', 'Aucun effet', 'Aucun effet actif', 'none', 0),
('TIME_MINUS_3', 'Temps réduit', 'Réduit le temps de réponse de 3 secondes', 'penalty', 3),
('DOUBLE_CLICK', 'Double clic', 'Doit cliquer deux fois', 'modifier', 0),
('SHUFFLE_CHOICES', 'Réponses mélangées', 'Mélange les réponses', 'modifier', 0);

-- QUESTIONS

INSERT INTO questions (question_type_id, question_text, media_type, media_path)
VALUES (2, 'Quel est ce film ?', 'image', '/media/interstellar.jpg');

INSERT INTO choices (question_id, label, choice_text, choice_order, is_correct) VALUES
(1, 'A', 'Inception', 1, 0),
(1, 'B', 'Interstellar', 2, 1),
(1, 'C', 'Tenet', 3, 0),
(1, 'D', 'Dunkerque', 4, 0);

INSERT INTO questions (question_type_id, question_text)
VALUES (1, 'Qui est le héros principal de Zelda ?');

INSERT INTO choices (question_id, label, choice_text, choice_order, is_correct) VALUES
(2, 'A', 'Zelda', 1, 0),
(2, 'B', 'Link', 2, 1),
(2, 'C', 'Ganondorf', 3, 0),
(2, 'D', 'Midna', 4, 0);

INSERT INTO questions (question_type_id, question_text, media_type, media_path, correct_text)
VALUES (3, 'Mario est un ______.', 'video', '/media/mario.mp4', 'plombier');

-- ROOM
INSERT INTO rooms (room_code, host_name, status, current_phase)
VALUES ('ABC123', 'Host', 'in_progress', 'question_live');

-- PLAYERS
INSERT INTO room_players (room_id, nickname, score, correct_answers, status) VALUES
(1, 'Alice', 250, 2, 'alive'),
(1, 'Bob', 180, 1, 'alive'),
(1, 'Charlie', 90, 1, 'alive'),
(1, 'Dave', 40, 0, 'alive');

-- ROOM QUESTIONS
INSERT INTO room_questions (room_id, question_id, question_order) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3);

-- ANSWERS
INSERT INTO player_answers (room_id, room_player_id, question_id, choice_id, is_correct, points_earned, response_time_ms)
VALUES (1, 1, 1, 2, 1, 140, 5000);

INSERT INTO player_answers (room_id, room_player_id, question_id, choice_id, is_correct, points_earned, response_time_ms)
VALUES (1, 2, 1, 2, 1, 110, 12000);

INSERT INTO player_answers (room_id, room_player_id, question_id, choice_id, is_correct, points_earned)
VALUES (1, 3, 1, 1, 0, 0);

INSERT INTO player_answers (room_id, room_player_id, question_id, is_correct, points_earned)
VALUES (1, 4, 1, 0, -20);

-- ELIMINATION
UPDATE room_players
SET status = 'eliminated',
    eliminated_at = NOW(),
    final_rank = 4
WHERE id = 4;
