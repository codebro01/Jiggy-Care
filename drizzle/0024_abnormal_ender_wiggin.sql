CREATE TABLE "cart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"items" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cart_patient_id_unique" UNIQUE("patient_id")
);
--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_patient_id_patients_userId_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("userId") ON DELETE cascade ON UPDATE no action;