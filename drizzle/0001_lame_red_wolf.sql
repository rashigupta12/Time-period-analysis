ALTER TABLE "bill_photos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customer_visiting_cards" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_items" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "bill_photos" CASCADE;--> statement-breakpoint
DROP TABLE "customer_visiting_cards" CASCADE;--> statement-breakpoint
DROP TABLE "customers" CASCADE;--> statement-breakpoint
DROP TABLE "order_items" CASCADE;--> statement-breakpoint
DROP TABLE "orders" CASCADE;--> statement-breakpoint
DROP TABLE "products" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'DATA_ANALYST'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'DATA_ANALYST');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'DATA_ANALYST'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
DROP TYPE "public"."order_status";