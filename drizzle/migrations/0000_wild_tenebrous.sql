CREATE TABLE `media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` varchar(10) NOT NULL,
	`title` varchar(255) NOT NULL,
	`file_url` text NOT NULL,
	`cover_url` text,
	`file_key` text NOT NULL,
	`mime_type` varchar(100),
	`size` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`last_heartbeat` timestamp DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nickname` varchar(50) NOT NULL,
	`profile_photo` text,
	`nickname_color` varchar(7) DEFAULT '#00ffff',
	`mood` varchar(10) DEFAULT '😊',
	`created_at` timestamp DEFAULT (now()),
	`last_seen_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_nickname_unique` UNIQUE(`nickname`)
);
