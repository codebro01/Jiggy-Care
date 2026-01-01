ALTER TABLE "cart" ALTER COLUMN "items" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "cart_id" SET DEFAULT '60f2cc4e-3002-44bc-89ea-f91c419ebab4';