CREATE TYPE "public"."Booking_Status_Type" AS ENUM('completed', 'upcoming', 'in_progress', 'cancelled', 'no_show', 'disputed', 'pending_confirmation', 'stale');--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE "public"."Booking_Status_Type" USING "status"::text::"public"."Booking_Status_Type";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'upcoming';--> statement-breakpoint
DROP TYPE "public"."booking_status_type";