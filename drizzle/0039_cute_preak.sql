ALTER TABLE "bookings" ALTER COLUMN "duration" SET DEFAULT 30;--> statement-breakpoint
ALTER TABLE "consultants" ADD COLUMN "login_otp" varchar(255);--> statement-breakpoint
ALTER TABLE "consultants" ADD COLUMN "login_otp_expires_at" timestamp;