ALTER TABLE "bookings" ALTER COLUMN "symptoms" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "speciality" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "speciality" ADD CONSTRAINT "speciality_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;