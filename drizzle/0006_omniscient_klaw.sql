CREATE TABLE "test_booking_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"testBookingId" uuid NOT NULL,
	"patientId" uuid NOT NULL,
	"invoice_id" text,
	"reference" text,
	"date_initiated" text,
	"amount" double precision NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "test_booking_payment" ADD CONSTRAINT "test_booking_payment_testBookingId_test_bookings_id_fk" FOREIGN KEY ("testBookingId") REFERENCES "public"."test_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_booking_payment" ADD CONSTRAINT "test_booking_payment_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_bookings" DROP COLUMN "payment_method";