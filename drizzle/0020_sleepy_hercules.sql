ALTER TABLE "users" ALTER COLUMN "password" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" varchar(255) NOT NULL;