CREATE TYPE "public"."booking_status_type" AS ENUM('completed', 'upcoming');--> statement-breakpoint
CREATE TYPE "public"."health_reading_type" AS ENUM('blood_pressure', 'heart_rate', 'temperature', 'weight');--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('booking', 'order', 'health_tips');--> statement-breakpoint
CREATE TYPE "public"."notification_status_type" AS ENUM('read', 'unread');--> statement-breakpoint
CREATE TYPE "public"."variant_type" AS ENUM('info', 'success', 'warning', 'danger');--> statement-breakpoint
CREATE TYPE "public"."dosage_type" AS ENUM('once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'five_times_daily', 'often');--> statement-breakpoint
CREATE TYPE "public"."test_collection_type" AS ENUM('home_collection', 'visit_lab_centre');--> statement-breakpoint
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
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sender_type" text NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_monitoring" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patientId" uuid NOT NULL,
	"temperature" jsonb,
	"heart_rate" jsonb,
	"weight" jsonb,
	"blood_pressure" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
	"price_per_session" integer,
	CONSTRAINT "consultants_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"userId" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emergencyContact" varchar(255),
	"weight" varchar(50),
	"height" varchar(50),
	"bloodType" varchar(50),
	CONSTRAINT "patients_userId_unique" UNIQUE("userId")
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
	"dosage" varchar(100) NOT NULL,
	"frequency" "dosage_type" NOT NULL,
	"pills_remaining" integer NOT NULL,
	"total_pills" integer NOT NULL,
	"start_date" date NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"gram" integer NOT NULL,
	"description" text NOT NULL,
	"price" double precision NOT NULL,
	"rating" double precision DEFAULT 0,
	"stock_status" varchar(50) DEFAULT 'in_stock' NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"category" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdBy" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdBy" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"preparation" text NOT NULL,
	"duration_in_hrs" integer NOT NULL,
	"amount" double precision NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"testId" uuid NOT NULL,
	"labId" uuid,
	"patientId" uuid NOT NULL,
	"payment_status" text NOT NULL,
	"invoice_id" text,
	"reference" text,
	"payment_method" text NOT NULL,
	"collection" "test_collection_type" NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar(50) NOT NULL,
	"userId" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"reference" varchar(100) NOT NULL,
	"items" jsonb NOT NULL,
	"total_amount" double precision NOT NULL,
	"delivery_address" text NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"payment_method" text NOT NULL,
	"transaction_type" text NOT NULL,
	"delivery_date" timestamp,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
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
CREATE TABLE "test_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" uuid NOT NULL,
	"lab_id" uuid,
	"title" varchar(255) NOT NULL,
	"date" timestamp NOT NULL,
	"test_values" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_consultant_id_consultants_userId_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_patient_id_patients_userId_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_monitoring" ADD CONSTRAINT "health_monitoring_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_bookings" ADD CONSTRAINT "test_bookings_testId_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_bookings" ADD CONSTRAINT "test_bookings_labId_labs_id_fk" FOREIGN KEY ("labId") REFERENCES "public"."labs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_bookings" ADD CONSTRAINT "test_bookings_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_consultantId_users_id_fk" FOREIGN KEY ("consultantId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_consultant_id_consultants_userId_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_consultant_id_patients_userId_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."patients"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_lab_id_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "public"."labs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consultantId_idx" ON "bookings" USING btree ("consultantId");--> statement-breakpoint
CREATE INDEX "patientId_idx" ON "bookings" USING btree ("patientId");--> statement-breakpoint
CREATE INDEX "bookingDate_idx" ON "bookings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "consultant_patient_idx" ON "conversations" USING btree ("consultant_id","patient_id");--> statement-breakpoint
CREATE INDEX "conversation_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "messages" USING btree ("created_at");