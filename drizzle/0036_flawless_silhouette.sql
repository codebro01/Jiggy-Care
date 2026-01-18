ALTER TABLE "health_monitoring" DROP CONSTRAINT "health_monitoring_patientId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "health_monitoring" ADD CONSTRAINT "health_monitoring_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;