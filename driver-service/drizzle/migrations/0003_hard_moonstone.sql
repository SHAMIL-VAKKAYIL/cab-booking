CREATE TYPE "public"."vehicle_type" AS ENUM('ECONOMY', 'PREMIUM');--> statement-breakpoint
ALTER TABLE "drivers" RENAME COLUMN "availablity" TO "availability";--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "vehicle_type" "vehicle_type";--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "average_rating" numeric(3, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "total_ratings" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_email_unique" UNIQUE("email");