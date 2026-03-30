PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS themes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS question_types (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY,
  theme_id INTEGER NOT NULL,
  question_type_id INTEGER NOT NULL,
  title TEXT,
  question_text TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'none',
  media_path TEXT,
  correct_text TEXT,
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'easy',
  base_points INTEGER NOT NULL DEFAULT 100,
  answer_time_seconds INTEGER NOT NULL DEFAULT 20,
  reveal_time_seconds INTEGER NOT NULL DEFAULT 5,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(theme_id) REFERENCES themes(id),
  FOREIGN KEY(question_type_id) REFERENCES question_types(id)
);

CREATE TABLE IF NOT EXISTS choices (
  id INTEGER PRIMARY KEY,
  question_id INTEGER NOT NULL,
  label TEXT,
  choice_text TEXT NOT NULL,
  choice_order INTEGER NOT NULL DEFAULT 1,
  is_correct INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL UNIQUE,
  host_name TEXT,
  theme_id INTEGER,
  status TEXT NOT NULL DEFAULT 'lobby',
  current_question_id INTEGER,
  current_room_question_id INTEGER,
  current_question_order INTEGER NOT NULL DEFAULT 0,
  current_phase TEXT NOT NULL DEFAULT 'waiting',
  elimination_interval_seconds INTEGER NOT NULL DEFAULT 120,
  max_players INTEGER NOT NULL DEFAULT 8,
  phase_started_at TEXT,
  phase_ends_at TEXT,
  next_elimination_at TEXT,
  last_elimination_player_id INTEGER,
  last_elimination_at TEXT,
  started_at TEXT,
  ended_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(theme_id) REFERENCES themes(id),
  FOREIGN KEY(current_question_id) REFERENCES questions(id),
  FOREIGN KEY(current_room_question_id) REFERENCES room_questions(id),
  FOREIGN KEY(last_elimination_player_id) REFERENCES room_players(id)
);

CREATE TABLE IF NOT EXISTS room_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  average_response_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'alive',
  is_active INTEGER NOT NULL DEFAULT 1,
  eliminated_at TEXT,
  final_rank INTEGER,
  joined_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(room_id, nickname),
  FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  question_order INTEGER NOT NULL,
  asked_at TEXT,
  revealed_at TEXT,
  UNIQUE(room_id, question_order),
  FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY(question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS player_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  room_player_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  choice_id INTEGER,
  typed_answer TEXT,
  is_correct INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  response_time_ms INTEGER,
  answered_at TEXT NOT NULL,
  UNIQUE(room_player_id, question_id),
  FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY(room_player_id) REFERENCES room_players(id) ON DELETE CASCADE,
  FOREIGN KEY(question_id) REFERENCES questions(id),
  FOREIGN KEY(choice_id) REFERENCES choices(id)
);

CREATE INDEX IF NOT EXISTS idx_choices_question ON choices(question_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_status ON room_players(status);
CREATE INDEX IF NOT EXISTS idx_room_questions_room ON room_questions(room_id);
CREATE INDEX IF NOT EXISTS idx_player_answers_room ON player_answers(room_id);
CREATE INDEX IF NOT EXISTS idx_player_answers_question ON player_answers(question_id);
