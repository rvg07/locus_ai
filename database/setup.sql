CREATE DATABASE IF NOT EXISTS locus_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET time_zone = '+02:00';
USE locus_ai;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) DEFAULT NULL,
  `auth_token` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_preferences`;
CREATE TABLE `user_preferences` (
  `preference_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `productive_hours_start` TIME DEFAULT '09:00:00',
  `productive_hours_end` TIME DEFAULT '12:00:00',
  `focus_block_duration` INT DEFAULT 90,
  `wants_break_after_meeting` BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (`preference_id`),
  UNIQUE KEY `user_id_unique` (`user_id`),
  CONSTRAINT `fk_preferences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `task_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `status` ENUM('to_do', 'in_progress', 'completed') NOT NULL DEFAULT 'to_do',
  `due_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`task_id`),
  CONSTRAINT `fk_tasks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `event_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `external_calendar_id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `cognitive_load` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `category` ENUM('meeting', 'focused_work', 'break') DEFAULT 'meeting',
  PRIMARY KEY (`event_id`),
  UNIQUE KEY `user_external_id_unique` (`user_id`, `external_calendar_id`),
  CONSTRAINT `fk_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `generated_content`;
CREATE TABLE `generated_content` (
  `content_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `content_type` ENUM('morning_briefing', 'meeting_recap', 'daily_debriefing') NOT NULL,
  `generated_text` TEXT NOT NULL,
  `related_event_id` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`content_id`),
  CONSTRAINT `fk_content_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_content_event` FOREIGN KEY (`related_event_id`) REFERENCES `events` (`event_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `activity_log`;
CREATE TABLE `activity_log` (
  `log_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `activity_type` ENUM('meeting', 'focused_work', 'break', 'other') NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `duration_minutes` INT UNSIGNED NOT NULL,
  `notes` TEXT,
  PRIMARY KEY (`log_id`),
  CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;