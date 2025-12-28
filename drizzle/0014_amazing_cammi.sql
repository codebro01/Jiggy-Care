ALTER TABLE "consultants" DROP CONSTRAINT "consultants_speciality_id_speciality_id_fk";
--> statement-breakpoint
ALTER TABLE "consultants" ALTER COLUMN "speciality_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_speciality_id_speciality_id_fk" FOREIGN KEY ("speciality_id") REFERENCES "public"."speciality"("id") ON DELETE cascade ON UPDATE no action;