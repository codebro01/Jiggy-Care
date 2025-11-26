CREATE TYPE "public"."booking_status_type" AS ENUM('completed', 'upcoming');--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('payment', 'campaign');--> statement-breakpoint
CREATE TYPE "public"."notification_status_type" AS ENUM('read', 'unread');--> statement-breakpoint
CREATE TYPE "public"."variant_type" AS ENUM('info', 'success', 'warning', 'danger');--> statement-breakpoint
CREATE TYPE "public"."dosage_type" AS ENUM('once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'five_times_daily', 'often');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultantId" uuid NOT NULL,
	"patientId" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"duration" integer DEFAULT 1,
	"symptoms" text[],
	"status" "booking_status_type" DEFAULT 'upcoming' NOT NULL,
	"payment_status" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"availability" boolean DEFAULT false,
	"speciality" varchar(50),
	"years_of_experience" integer,
	"about" text,
	"languages" text[],
	"education" text[],
	"certification" text[],
	"working_hours" jsonb,
	"price_per_session" integer
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"userId" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emergencyContact" varchar(255),
	"weight" varchar(50),
	"height" varchar(50),
	"bloodType" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(10) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_email_Verified" boolean DEFAULT false NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"date_of_birth" varchar(20),
	"gender" varchar(20),
	"dp" varchar(255),
	"phone" varchar(50),
	"authProvider" varchar(20) DEFAULT 'local' NOT NULL,
	"refreshToken" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
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
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"status" "notification_status_type" DEFAULT 'unread' NOT NULL,
	"variant" "variant_type" DEFAULT 'info' NOT NULL,
	"category" "category_type" NOT NULL,
	"priority" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patientId" uuid NOT NULL,
	"consultantId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"dosage" "dosage_type" NOT NULL,
	"frequency" varchar(100) NOT NULL,
	"pills_remaining" integer NOT NULL,
	"total_pills" integer NOT NULL,
	"start_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consultantId_idx" ON "bookings" USING btree ("consultantId");--> statement-breakpoint
CREATE INDEX "patientId_idx" ON "bookings" USING btree ("patientId");--> statement-breakpoint
CREATE INDEX "bookingDate_idx" ON "bookings" USING btree ("date");