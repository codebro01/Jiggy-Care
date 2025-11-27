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
