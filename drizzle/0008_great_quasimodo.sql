ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_patientId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_consultantId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_patients_userId_fk" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultantId_consultants_userId_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."consultants"("userId") ON DELETE cascade ON UPDATE no action;