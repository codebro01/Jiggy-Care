ALTER TABLE "consultants" DROP CONSTRAINT "consultants_speciality_speciality_id_fk";
--> statement-breakpoint
ALTER TABLE "consultants" ALTER COLUMN "speciality" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_speciality_speciality_id_fk" FOREIGN KEY ("speciality") REFERENCES "public"."speciality"("id") ON DELETE set null ON UPDATE no action;