CREATE TABLE `budget_rules` (
	`rule_id` integer PRIMARY KEY NOT NULL,
	`budget_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`amount_cents` integer NOT NULL,
	`threshold_cents` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`budget_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "budget_rules_amount_check" CHECK("budget_rules"."amount_cents" >= 0),
	CONSTRAINT "budget_rules_threshold_check" CHECK("budget_rules"."threshold_cents" IS NULL OR "budget_rules"."threshold_cents" <= "budget_rules"."amount_cents")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_budget_rules_budget_category` ON `budget_rules` (`budget_id`,`category_id`);--> statement-breakpoint
CREATE INDEX `idx_budget_rules_category` ON `budget_rules` (`category_id`);--> statement-breakpoint
CREATE TABLE `budgets` (
	`budget_id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`budget_name` text,
	`start_date` text,
	`end_date` text,
	`is_recurring` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_budgets_user` ON `budgets` (`user_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`category_id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "categories_type_check" CHECK("categories"."type" IN ('Food', 'School', 'Misc'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_categories_user_name` ON `categories` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`transaction_id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`category_id` integer,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`type` text NOT NULL,
	`merchant` text,
	`transaction_date` text NOT NULL,
	`is_recurring` integer DEFAULT false NOT NULL,
	`frequency` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "transactions_type_check" CHECK("transactions"."type" IN ('income', 'expense')),
	CONSTRAINT "transactions_frequency_check" CHECK("transactions"."frequency" IN ('daily', 'weekly', 'monthly', 'yearly'))
);
--> statement-breakpoint
CREATE INDEX `idx_transactions_user_date` ON `transactions` (`user_id`,`transaction_date`);--> statement-breakpoint
CREATE INDEX `idx_transactions_category` ON `transactions` (`category_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`auth_id` text,
	`date_of_birth` text,
	`first_name` text,
	`second_name` text,
	`email_address` text,
	`alt_email_address` text,
	`address` text,
	`phone_number` text,
	`currency` text,
	`has_profile_picture` integer DEFAULT false NOT NULL,
	`profile_picture_name` text,
	`profile_picture_path` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_auth_id_unique` ON `users` (`auth_id`);