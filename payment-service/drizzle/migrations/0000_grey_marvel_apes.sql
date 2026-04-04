CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"rider_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"transaction_id" varchar(255),
	"failure_reason" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_trip_id_unique" UNIQUE("trip_id")
);
