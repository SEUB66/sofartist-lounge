CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lastActivity` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `posts` ADD `videoUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `authorized` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhoto` text;--> statement-breakpoint
ALTER TABLE `users` ADD `customIcon` varchar(10);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `profilePicture`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `nickname`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `theme`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `color`;