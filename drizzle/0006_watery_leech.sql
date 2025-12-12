CREATE TYPE "public"."health_reading_type" AS ENUM('blood_pressure', 'heart_rate', 'temperature', 'weight');--> statement-breakpoint
CREATE TABLE "health_monitoring" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patientId" uuid NOT NULL,
	"temperature" jsonb,
	"heart_rate" jsonb,
	"weight" jsonb,
	"blood_pressure" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "test_bookings" RENAME COLUMN "date_initiated" TO "date";--> statement-breakpoint
ALTER TABLE "test_bookings" ADD COLUMN "labId" uuid;--> statement-breakpoint
ALTER TABLE "test_bookings" ADD COLUMN "collection" "test_collection_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "health_monitoring" ADD CONSTRAINT "health_monitoring_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_bookings" ADD CONSTRAINT "test_bookings_labId_labs_id_fk" FOREIGN KEY ("labId") REFERENCES "public"."labs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_bookings" DROP COLUMN "amount";