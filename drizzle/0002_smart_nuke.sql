ALTER TABLE "messages" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "file_url" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "file_type" text;