CREATE TYPE "public"."chatbot_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TABLE "chatbot_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patientId" uuid NOT NULL,
	"sessionId" uuid NOT NULL,
	"role" "chatbot_role" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chatbot_messages" ADD CONSTRAINT "chatbot_messages_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;