ALTER TABLE "drivers" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "license_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "license_expiry" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "vehicle_model" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "vehicle_plate" DROP NOT NULL;