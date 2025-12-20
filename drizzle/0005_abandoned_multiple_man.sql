ALTER TABLE "test_bookings" ALTER COLUMN "payment_status" SET DEFAULT 'UNPAID';--> statement-breakpoint
ALTER TABLE "test_bookings" ALTER COLUMN "payment_method" DROP NOT NULL;