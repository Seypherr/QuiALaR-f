INSERT OR IGNORE INTO themes (id, name, slug, description, created_at, updated_at) VALUES
  (1, 'Cinema', 'cinema', 'Questions autour du cinema', '2026-03-30T11:36:32.000Z', '2026-03-30T11:36:32.000Z'),
  (2, 'Jeux video', 'jeux-video', 'Questions autour des jeux video', '2026-03-30T11:36:32.000Z', '2026-03-30T11:36:32.000Z');

INSERT OR IGNORE INTO question_types (id, code, name) VALUES
  (1, 'qcm', 'QCM'),
  (2, 'media', 'Question media'),
  (3, 'text_hole', 'Texte a trous');

INSERT OR IGNORE INTO questions (
  id,
  theme_id,
  question_type_id,
  title,
  question_text,
  media_type,
  media_path,
  correct_text,
  explanation,
  difficulty,
  base_points,
  answer_time_seconds,
  reveal_time_seconds,
  is_active,
  created_at,
  updated_at
) VALUES
  (1, 1, 2, 'Reference film', 'A quel film correspond cette image ?', 'image', '/media/cinema/interstellar.jpg', NULL, 'La bonne reponse est Interstellar.', 'easy', 100, 20, 5, 1, '2026-03-30T11:36:32.000Z', '2026-03-30T11:36:32.000Z'),
  (2, 2, 1, 'Personnage iconique', 'Quel personnage est le heros principal de la licence Zelda ?', 'none', NULL, NULL, 'Le heros principal est Link.', 'easy', 100, 20, 5, 1, '2026-03-30T11:36:32.000Z', '2026-03-30T11:36:32.000Z'),
  (3, 2, 3, 'Texte a trous', 'Complete : Mario est un ______.', 'video', '/media/jeux-video/mario.mp4', 'plombier', 'Mario est un plombier.', 'easy', 100, 20, 5, 1, '2026-03-30T11:36:32.000Z', '2026-03-30T11:36:32.000Z'),
  (4, 1, 1, 'Saga culte', 'Dans quelle saga trouve-t-on le personnage de Neo ?', 'none', NULL, NULL, 'Neo est le personnage principal de Matrix.', 'easy', 100, 20, 5, 1, '2026-03-30T11:36:32.000Z', '2026-03-30T11:36:32.000Z'),
  (5, 1, 1, 'Replique legendaire', 'Quel film contient la replique Je suis ton pere ?', 'none', NULL, NULL, 'Cette replique est associee a L Empire contre-attaque.', 'easy', 100, 20, 5, 1, '2026-03-30T11:36:32.000Z', '2026-03-30T11:36:32.000Z'),
  (6, 1, 2, 'Univers magique', 'A quelle saga appartient cette image ?', 'image', '/media/cinema/harry-potter.jpg', NULL, 'Cette image renvoie a l univers Harry Potter.', 'easy', 100, 20, 5, 1, '2026-03-30T11:36:32.000Z', '2026-03-30T11:36:32.000Z'),
  (7, 2, 1, 'Console Nintendo', 'Quel est le nom de la console hybride de Nintendo sortie en 2017 ?', 'none', NULL, NULL, 'La bonne reponse est Nintendo Switch.', 'easy', 100, 20, 5, 1, '2026-03-30T11:36:32.000Z', '2026-03-30T11:36:32.000Z');

INSERT OR IGNORE INTO choices (id, question_id, label, choice_text, choice_order, is_correct, created_at) VALUES
  (1, 1, 'A', 'Inception', 1, 0, '2026-03-30T11:36:32.000Z'),
  (2, 1, 'B', 'Interstellar', 2, 1, '2026-03-30T11:36:32.000Z'),
  (3, 1, 'C', 'Tenet', 3, 0, '2026-03-30T11:36:32.000Z'),
  (4, 1, 'D', 'Dunkerque', 4, 0, '2026-03-30T11:36:32.000Z'),
  (5, 2, 'A', 'Zelda', 1, 0, '2026-03-30T11:36:32.000Z'),
  (6, 2, 'B', 'Link', 2, 1, '2026-03-30T11:36:32.000Z'),
  (7, 2, 'C', 'Ganondorf', 3, 0, '2026-03-30T11:36:32.000Z'),
  (8, 2, 'D', 'Midna', 4, 0, '2026-03-30T11:36:32.000Z'),
  (9, 4, 'A', 'Matrix', 1, 1, '2026-03-30T11:36:32.000Z'),
  (10, 4, 'B', 'John Wick', 2, 0, '2026-03-30T11:36:32.000Z'),
  (11, 4, 'C', 'Blade Runner', 3, 0, '2026-03-30T11:36:32.000Z'),
  (12, 4, 'D', 'Mad Max', 4, 0, '2026-03-30T11:36:32.000Z'),
  (13, 5, 'A', 'Le Retour du Jedi', 1, 0, '2026-03-30T11:36:32.000Z'),
  (14, 5, 'B', 'Un nouvel espoir', 2, 0, '2026-03-30T11:36:32.000Z'),
  (15, 5, 'C', 'L Empire contre-attaque', 3, 1, '2026-03-30T11:36:32.000Z'),
  (16, 5, 'D', 'La Menace fantome', 4, 0, '2026-03-30T11:36:32.000Z'),
  (17, 6, 'A', 'Le Seigneur des anneaux', 1, 0, '2026-03-30T11:36:32.000Z'),
  (18, 6, 'B', 'Harry Potter', 2, 1, '2026-03-30T11:36:32.000Z'),
  (19, 6, 'C', 'Narnia', 3, 0, '2026-03-30T11:36:32.000Z'),
  (20, 6, 'D', 'Fantastic Beasts', 4, 0, '2026-03-30T11:36:32.000Z'),
  (21, 7, 'A', 'Wii U', 1, 0, '2026-03-30T11:36:32.000Z'),
  (22, 7, 'B', 'Nintendo Switch', 2, 1, '2026-03-30T11:36:32.000Z'),
  (23, 7, 'C', 'Nintendo DS', 3, 0, '2026-03-30T11:36:32.000Z'),
  (24, 7, 'D', 'GameCube', 4, 0, '2026-03-30T11:36:32.000Z');
