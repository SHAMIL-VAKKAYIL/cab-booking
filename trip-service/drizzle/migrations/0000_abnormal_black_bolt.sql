CREATE TYPE "public"."trip_status" AS ENUM('REQUESTED', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('ECONOMY', 'PREMIUM');--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rider_id" uuid NOT NULL,
	"driver_id" uuid,
	"status" "trip_status" DEFAULT 'REQUESTED' NOT NULL,
	"pickup_address" text NOT NULL,
	"pickup_lat" numeric(10, 7) NOT NULL,
	"pickup_lng" numeric(10, 7) NOT NULL,
	"dropoff_address" text NOT NULL,
	"dropoff_lat" numeric(10, 7) NOT NULL,
	"dropoff_lng" numeric(10, 7) NOT NULL,
	"vehicle_type" "vehicle_type" DEFAULT 'ECONOMY' NOT NULL,
	"estimated_fare" numeric(10, 2),
	"final_fare" numeric(10, 2),
	"distance_km" numeric(10, 2),
	"duration_mins" integer,
	"cancel_reason" text,
	"cancelled_by" varchar(20),
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
