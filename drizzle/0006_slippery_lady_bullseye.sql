ALTER TABLE `users` ADD `profilePicture` text;--> statement-breakpoint
ALTER TABLE `users` ADD `nickname` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `theme` enum('dark','light','unicorn') DEFAULT 'dark';--> statement-breakpoint
ALTER TABLE `users` ADD `color` varchar(50);