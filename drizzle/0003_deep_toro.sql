ALTER TABLE "consultants" DROP CONSTRAINT "consultants_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;