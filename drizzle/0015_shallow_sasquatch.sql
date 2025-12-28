ALTER TABLE "consultants" DROP CONSTRAINT "consultants_speciality_id_speciality_id_fk";
--> statement-breakpoint
ALTER TABLE "consultants" ALTER COLUMN "speciality" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "consultants" ALTER COLUMN "speciality" SET DEFAULT '04485053-bd76-4ca4-a8ee-250fb82cbea8';--> statement-breakpoint
ALTER TABLE "consultants" ALTER COLUMN "speciality" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_speciality_speciality_id_fk" FOREIGN KEY ("speciality") REFERENCES "public"."speciality"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultants" DROP COLUMN "speciality_id";--> statement-breakpoint
ALTER TABLE "consultants" DROP COLUMN "price_per_session";