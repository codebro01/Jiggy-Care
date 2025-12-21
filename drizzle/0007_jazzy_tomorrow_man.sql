ALTER TABLE "prescriptions" ALTER COLUMN "dosage" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "mg" integer NOT NULL;