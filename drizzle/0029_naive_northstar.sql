CREATE TYPE "public"."order_delivery_status_type" AS ENUM('DELIVERED', 'PROCESSING');--> statement-breakpoint
CREATE TYPE "public"."order_payment_status" AS ENUM('unpaid', 'paid');--> statement-breakpoint
ALTER TYPE "public"."booking_status_type" ADD VALUE 'in_progress';--> statement-breakpoint
ALTER TYPE "public"."booking_status_type" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TYPE "public"."booking_status_type" ADD VALUE 'no_show';--> statement-breakpoint
ALTER TYPE "public"."booking_status_type" ADD VALUE 'disputed';--> statement-breakpoint
ALTER TYPE "public"."booking_status_type" ADD VALUE 'pending_confirmation';--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_consultantId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "consultants" ALTER COLUMN "speciality" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'unpaid'::"public"."order_payment_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DATA TYPE "public"."order_payment_status" USING "payment_status"::"public"."order_payment_status";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "actual_start" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "actual_end" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "consultant_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "patient_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "consultant_marked_no_show" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "consultant_confirmed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "patient_confirmed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "patient_marked_no_show" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "consultation_notes" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "dispute_reason" text;--> statement-breakpoint
ALTER TABLE "test_bookings" ADD COLUMN "completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "test_results" ADD COLUMN "test_booking_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_status" "order_delivery_status_type" DEFAULT 'PROCESSING';--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_consultantId_consultants_userId_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."consultants"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_test_booking_id_test_bookings_id_fk" FOREIGN KEY ("test_booking_id") REFERENCES "public"."test_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_bookings" DROP COLUMN "invoice_id";--> statement-breakpoint
ALTER TABLE "test_bookings" DROP COLUMN "reference";