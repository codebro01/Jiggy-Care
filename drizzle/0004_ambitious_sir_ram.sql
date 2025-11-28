ALTER TABLE "notifications" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."category_type";--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('booking', 'order');--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "category" SET DATA TYPE "public"."category_type" USING "category"::"public"."category_type";