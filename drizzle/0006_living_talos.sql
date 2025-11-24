ALTER TABLE "bookings" ALTER COLUMN "symptoms" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "duration" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;