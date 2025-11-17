CREATE TABLE "consultants" (
	"availability" boolean DEFAULT false,
	"speciality" varchar(50),
	"years_of_experience" varchar(50),
	"about" text,
	"languages" text[],
	"education" text[],
	"certification" text[],
	"working_hours" varchar[],
	"price_per_session" integer
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"emergencyContact" varchar(255),
	"weight" varchar(50),
	"height" varchar(50),
	"bloodType" varchar(50)
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "fullName" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "displayName";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "emergencyContact";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "weight";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "height";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "bloodType";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_stage_complete";--> statement-breakpoint
DROP TYPE "public"."IDTypes";--> statement-breakpoint
DROP TYPE "public"."contactFrequencyType";--> statement-breakpoint
DROP TYPE "public"."preferredLanguage";--> statement-breakpoint
DROP TYPE "public"."profileVisibilityType";--> statement-breakpoint
DROP TYPE "public"."proofOfAddressType";--> statement-breakpoint
DROP TYPE "public"."propertyType";