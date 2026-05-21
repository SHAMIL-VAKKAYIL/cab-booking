CREATE TYPE "public"."driver_availability" AS ENUM('OFFLINE', 'ONLINE', 'ON_TRIP');--> statement-breakpoint
CREATE TYPE "public"."driver_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('ECONOMY', 'PREMIUM');--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100),
	"user_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"license_number" varchar(100),
	"license_expiry" timestamp with time zone,
	"vehicle_model" varchar(50),
	"vehicle_plate" varchar(50),
	"vehicle_type" "vehicle_type",
	"status" "driver_status" DEFAULT 'APPROVED' NOT NULL,
	"availability" "driver_availability" DEFAULT 'OFFLINE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_email_unique" UNIQUE("email")
);
