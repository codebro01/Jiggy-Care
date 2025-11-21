CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultantId" uuid NOT NULL,
	"patientId" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"symptoms" text,
	"payment_status" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patientId" uuid NOT NULL,
	"consultantId" uuid NOT NULL,
	"invoice_id" text,
	"reference" text,
	"bookingId" uuid NOT NULL,
	"date_initiated" text,
	"amount" double precision NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consultantId_idx" ON "bookings" USING btree ("consultantId");--> statement-breakpoint
CREATE INDEX "patientId_idx" ON "bookings" USING btree ("patientId");--> statement-breakpoint
CREATE INDEX "bookingDate_idx" ON "bookings" USING btree ("date");