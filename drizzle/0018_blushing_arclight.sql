ALTER TABLE "test_results" DROP CONSTRAINT "test_results_consultant_id_patients_userId_fk";
--> statement-breakpoint
ALTER TABLE "test_results" ADD COLUMN "patient_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_patient_id_patients_userId_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("userId") ON DELETE cascade ON UPDATE no action;