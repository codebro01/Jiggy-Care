ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_bookingId_bookings_id_fk";
--> statement-breakpoint
ALTER TABLE "prescriptions" DROP COLUMN "bookingId";