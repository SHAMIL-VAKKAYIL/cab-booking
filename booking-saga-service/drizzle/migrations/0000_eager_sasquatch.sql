CREATE TYPE "public"."saga_status" AS ENUM('STARTED', 'FARE_CALCULATED', 'DRIVER_FOUND', 'TRIP_CREATED', 'CONFIRMED', 'FAILED', 'COMPENSATING');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('ECONOMY', 'PREMIUM');--> statement-breakpoint
CREATE TABLE "booking_sagas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_id" uuid NOT NULL,
	"rider_id" uuid NOT NULL,
	"status" "saga_status" DEFAULT 'STARTED' NOT NULL,
	"estimated_fare" numeric(10, 2),
	"distance_km" numeric(10, 2),
	"duration_mins" integer,
	"driver_id" uuid,
	"vehicle_type" "vehicle_type" DEFAULT 'ECONOMY' NOT NULL,
	"trip_id" uuid,
	"pickup_address" text NOT NULL,
	"pickup_lat" numeric(10, 7) NOT NULL,
	"pickup_lng" numeric(10, 7) NOT NULL,
	"dropoff_address" text NOT NULL,
	"dropoff_lat" numeric(10, 7) NOT NULL,
	"dropoff_lng" numeric(10, 7) NOT NULL,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_sagas_ride_id_unique" UNIQUE("ride_id")
);
