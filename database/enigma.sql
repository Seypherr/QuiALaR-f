-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 30 mars 2026 à 11:38
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `enigma`
--

-- --------------------------------------------------------

--
-- Structure de la table `choices`
--

CREATE TABLE `choices` (
  `id` int(10) UNSIGNED NOT NULL,
  `question_id` int(10) UNSIGNED NOT NULL,
  `label` char(1) DEFAULT NULL,
  `choice_text` varchar(255) NOT NULL,
  `choice_order` int(11) NOT NULL DEFAULT 1,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `choices`
--

INSERT INTO `choices` (`id`, `question_id`, `label`, `choice_text`, `choice_order`, `is_correct`, `created_at`) VALUES
(1, 1, 'A', 'Inception', 1, 0, '2026-03-30 11:36:32'),
(2, 1, 'B', 'Interstellar', 2, 1, '2026-03-30 11:36:32'),
(3, 1, 'C', 'Tenet', 3, 0, '2026-03-30 11:36:32'),
(4, 1, 'D', 'Dunkerque', 4, 0, '2026-03-30 11:36:32'),
(5, 2, 'A', 'Zelda', 1, 0, '2026-03-30 11:36:32'),
(6, 2, 'B', 'Link', 2, 1, '2026-03-30 11:36:32'),
(7, 2, 'C', 'Ganondorf', 3, 0, '2026-03-30 11:36:32'),
(8, 2, 'D', 'Midna', 4, 0, '2026-03-30 11:36:32');

-- --------------------------------------------------------

--
-- Structure de la table `effects`
--

CREATE TABLE `effects` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `effect_type` enum('none','penalty','modifier','bonus') NOT NULL DEFAULT 'none',
  `value_int` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `effects`
--

INSERT INTO `effects` (`id`, `code`, `name`, `description`, `effect_type`, `value_int`, `is_active`, `created_at`) VALUES
(1, 'NONE', 'Aucun effet', 'Aucun effet actif', 'none', 0, 1, '2026-03-30 11:36:32'),
(2, 'TIME_MINUS_3', 'Temps réduit', 'Réduit le temps de réponse de 3 secondes', 'penalty', 3, 1, '2026-03-30 11:36:32'),
(3, 'DOUBLE_CLICK', 'Double clic', 'Le joueur doit cliquer deux fois', 'modifier', 0, 1, '2026-03-30 11:36:32'),
(4, 'SHUFFLE_CHOICES', 'Réponses mélangées', 'Les réponses sont mélangées', 'modifier', 0, 1, '2026-03-30 11:36:32'),
(5, 'MOVING_BUTTON', 'Bouton mouvant', 'Les boutons se déplacent légèrement', 'modifier', 0, 1, '2026-03-30 11:36:32');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `leaderboard`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `leaderboard` (
`room_player_id` int(10) unsigned
,`room_id` int(10) unsigned
,`room_code` varchar(20)
,`nickname` varchar(50)
,`score` int(11)
,`correct_answers` int(11)
,`wrong_answers` int(11)
,`status` enum('alive','eliminated','winner')
,`final_rank` int(11)
,`eliminated_at` datetime
,`joined_at` datetime
);

-- --------------------------------------------------------

--
-- Structure de la table `player_answers`
--

CREATE TABLE `player_answers` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` int(10) UNSIGNED NOT NULL,
  `room_player_id` int(10) UNSIGNED NOT NULL,
  `question_id` int(10) UNSIGNED NOT NULL,
  `choice_id` int(10) UNSIGNED DEFAULT NULL,
  `typed_answer` varchar(255) DEFAULT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `points_earned` int(11) NOT NULL DEFAULT 0,
  `response_time_ms` int(11) DEFAULT NULL,
  `answered_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `questions`
--

CREATE TABLE `questions` (
  `id` int(10) UNSIGNED NOT NULL,
  `theme_id` int(10) UNSIGNED NOT NULL,
  `question_type_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `question_text` text NOT NULL,
  `media_type` enum('none','image','video') NOT NULL DEFAULT 'none',
  `media_path` varchar(255) DEFAULT NULL,
  `correct_text` varchar(255) DEFAULT NULL,
  `explanation` text DEFAULT NULL,
  `difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
  `base_points` int(11) NOT NULL DEFAULT 100,
  `answer_time_seconds` int(11) NOT NULL DEFAULT 20,
  `reveal_time_seconds` int(11) NOT NULL DEFAULT 5,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `questions`
--

INSERT INTO `questions` (`id`, `theme_id`, `question_type_id`, `title`, `question_text`, `media_type`, `media_path`, `correct_text`, `explanation`, `difficulty`, `base_points`, `answer_time_seconds`, `reveal_time_seconds`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'Référence film', 'À quel film correspond cette image ?', 'image', '/media/cinema/interstellar.jpg', NULL, 'La bonne réponse est Interstellar.', 'easy', 100, 20, 5, 1, '2026-03-30 11:36:32', '2026-03-30 11:36:32'),
(2, 2, 1, 'Personnage iconique', 'Quel personnage est le héros principal de la licence Zelda ?', 'none', NULL, NULL, 'Le héros principal est Link.', 'easy', 100, 20, 5, 1, '2026-03-30 11:36:32', '2026-03-30 11:36:32'),
(3, 2, 3, 'Texte à trous', 'Complète : Mario est un ______.', 'video', '/media/jeux-video/mario.mp4', 'plombier', 'Mario est un plombier.', 'easy', 100, 20, 5, 1, '2026-03-30 11:36:32', '2026-03-30 11:36:32');

-- --------------------------------------------------------

--
-- Structure de la table `question_types`
--

CREATE TABLE `question_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `question_types`
--

INSERT INTO `question_types` (`id`, `code`, `name`) VALUES
(1, 'qcm', 'QCM'),
(2, 'media', 'Question média'),
(3, 'text_hole', 'Texte à trous');

-- --------------------------------------------------------

--
-- Structure de la table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_code` varchar(20) NOT NULL,
  `host_name` varchar(100) DEFAULT NULL,
  `theme_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('lobby','in_progress','finished') NOT NULL DEFAULT 'lobby',
  `current_question_id` int(10) UNSIGNED DEFAULT NULL,
  `current_phase` enum('waiting','question_live','answer_reveal','elimination','finished') NOT NULL DEFAULT 'waiting',
  `elimination_interval_seconds` int(11) NOT NULL DEFAULT 120,
  `max_players` int(11) NOT NULL DEFAULT 20,
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `room_effects`
--

CREATE TABLE `room_effects` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` int(10) UNSIGNED NOT NULL,
  `effect_id` int(10) UNSIGNED NOT NULL,
  `starts_at` datetime NOT NULL,
  `ends_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `room_players`
--

CREATE TABLE `room_players` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` int(10) UNSIGNED NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `socket_id` varchar(100) DEFAULT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `correct_answers` int(11) NOT NULL DEFAULT 0,
  `wrong_answers` int(11) NOT NULL DEFAULT 0,
  `average_response_ms` int(11) DEFAULT NULL,
  `status` enum('alive','eliminated','winner') NOT NULL DEFAULT 'alive',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `eliminated_at` datetime DEFAULT NULL,
  `final_rank` int(11) DEFAULT NULL,
  `joined_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `room_questions`
--

CREATE TABLE `room_questions` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` int(10) UNSIGNED NOT NULL,
  `question_id` int(10) UNSIGNED NOT NULL,
  `question_order` int(11) NOT NULL,
  `asked_at` datetime DEFAULT NULL,
  `revealed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `themes`
--

CREATE TABLE `themes` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `themes`
--

INSERT INTO `themes` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Cinéma', 'cinema', 'Questions autour du cinéma', '2026-03-30 11:36:32', '2026-03-30 11:36:32'),
(2, 'Jeux vidéo', 'jeux-video', 'Questions autour des jeux vidéo', '2026-03-30 11:36:32', '2026-03-30 11:36:32');

-- --------------------------------------------------------

--
-- Structure de la vue `leaderboard`
--
DROP TABLE IF EXISTS `leaderboard`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `leaderboard`  AS SELECT `rp`.`id` AS `room_player_id`, `rp`.`room_id` AS `room_id`, `r`.`room_code` AS `room_code`, `rp`.`nickname` AS `nickname`, `rp`.`score` AS `score`, `rp`.`correct_answers` AS `correct_answers`, `rp`.`wrong_answers` AS `wrong_answers`, `rp`.`status` AS `status`, `rp`.`final_rank` AS `final_rank`, `rp`.`eliminated_at` AS `eliminated_at`, `rp`.`joined_at` AS `joined_at` FROM (`room_players` `rp` join `rooms` `r` on(`r`.`id` = `rp`.`room_id`)) ORDER BY `rp`.`room_id` DESC, `rp`.`score` DESC, `rp`.`correct_answers` DESC, `rp`.`joined_at` ASC ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `choices`
--
ALTER TABLE `choices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_choices_question` (`question_id`);

--
-- Index pour la table `effects`
--
ALTER TABLE `effects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `player_answers`
--
ALTER TABLE `player_answers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_player_question_once` (`room_player_id`,`question_id`),
  ADD KEY `fk_player_answers_choice` (`choice_id`),
  ADD KEY `idx_player_answers_room` (`room_id`),
  ADD KEY `idx_player_answers_question` (`question_id`);

--
-- Index pour la table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_questions_theme` (`theme_id`),
  ADD KEY `fk_questions_type` (`question_type_id`);

--
-- Index pour la table `question_types`
--
ALTER TABLE `question_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_code` (`room_code`),
  ADD KEY `fk_rooms_theme` (`theme_id`),
  ADD KEY `fk_rooms_current_question` (`current_question_id`);

--
-- Index pour la table `room_effects`
--
ALTER TABLE `room_effects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_room_effects_effect` (`effect_id`),
  ADD KEY `idx_room_effects_room` (`room_id`),
  ADD KEY `idx_room_effects_active` (`is_active`);

--
-- Index pour la table `room_players`
--
ALTER TABLE `room_players`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_room_nickname` (`room_id`,`nickname`),
  ADD KEY `idx_room_players_room` (`room_id`),
  ADD KEY `idx_room_players_status` (`status`),
  ADD KEY `idx_room_players_score` (`score`);

--
-- Index pour la table `room_questions`
--
ALTER TABLE `room_questions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_room_question_order` (`room_id`,`question_order`),
  ADD KEY `fk_room_questions_question` (`question_id`),
  ADD KEY `idx_room_questions_room` (`room_id`);

--
-- Index pour la table `themes`
--
ALTER TABLE `themes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `choices`
--
ALTER TABLE `choices`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `effects`
--
ALTER TABLE `effects`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `player_answers`
--
ALTER TABLE `player_answers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `question_types`
--
ALTER TABLE `question_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `room_effects`
--
ALTER TABLE `room_effects`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `room_players`
--
ALTER TABLE `room_players`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `room_questions`
--
ALTER TABLE `room_questions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `themes`
--
ALTER TABLE `themes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `choices`
--
ALTER TABLE `choices`
  ADD CONSTRAINT `fk_choices_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `player_answers`
--
ALTER TABLE `player_answers`
  ADD CONSTRAINT `fk_player_answers_choice` FOREIGN KEY (`choice_id`) REFERENCES `choices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_player_answers_player` FOREIGN KEY (`room_player_id`) REFERENCES `room_players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_player_answers_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_player_answers_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `fk_questions_theme` FOREIGN KEY (`theme_id`) REFERENCES `themes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_questions_type` FOREIGN KEY (`question_type_id`) REFERENCES `question_types` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `fk_rooms_current_question` FOREIGN KEY (`current_question_id`) REFERENCES `questions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rooms_theme` FOREIGN KEY (`theme_id`) REFERENCES `themes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `room_effects`
--
ALTER TABLE `room_effects`
  ADD CONSTRAINT `fk_room_effects_effect` FOREIGN KEY (`effect_id`) REFERENCES `effects` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_room_effects_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `room_players`
--
ALTER TABLE `room_players`
  ADD CONSTRAINT `fk_room_players_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `room_questions`
--
ALTER TABLE `room_questions`
  ADD CONSTRAINT `fk_room_questions_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_room_questions_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
