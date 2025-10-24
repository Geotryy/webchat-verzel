CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`leadName` varchar(255),
	`leadEmail` varchar(320),
	`leadCompany` varchar(255),
	`leadPhone` varchar(50),
	`leadNeed` text,
	`leadTimeline` varchar(100),
	`interestConfirmed` boolean DEFAULT false,
	`meetingScheduled` boolean DEFAULT false,
	`meetingLink` text,
	`meetingDateTime` timestamp,
	`pipefyCardId` varchar(255),
	`status` enum('active','qualified','scheduled','closed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversations_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(255),
	`phone` varchar(50),
	`need` text,
	`timeline` varchar(100),
	`interestConfirmed` boolean NOT NULL DEFAULT false,
	`meetingScheduled` boolean NOT NULL DEFAULT false,
	`meetingLink` text,
	`meetingDateTime` timestamp,
	`pipefyCardId` varchar(255),
	`status` enum('new','contacted','qualified','meeting_scheduled','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
