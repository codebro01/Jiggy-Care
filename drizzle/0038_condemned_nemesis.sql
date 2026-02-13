ALTER TABLE "bookings" ALTER COLUMN "actual_start" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "actual_end" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "consultant_completed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "patient_completed_at" SET DATA TYPE timestamp with time zone;