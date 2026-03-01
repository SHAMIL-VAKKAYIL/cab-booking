CREATE TYPE "public"."driver_availability" AS ENUM('OFFLINE', 'ONLINE', 'ON_TRIP');--> statement-breakpoint
CREATE TYPE "public"."driver_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"license_number" varchar(100) NOT NULL,
	"license_expiry" timestamp with time zone NOT NULL,
	"vehicle_model" varchar(50) NOT NULL,
	"vehicle_plate" varchar(50) NOT NULL,
	"status" "driver_status" DEFAULT 'APPROVED' NOT NULL,
	"avalablity" "driver_availability" DEFAULT 'OFFLINE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
