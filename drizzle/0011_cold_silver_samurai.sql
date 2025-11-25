CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultantId" uuid NOT NULL,
	"patientId" uuid NOT NULL,
	"rating" double precision NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;