import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  numeric,
  integer,
  text,
} from "drizzle-orm/pg-core";

export const sagaStatusEnum = pgEnum("saga_status", [
  "STARTED",
  "FARE_CALCULATED",
  "DRIVER_FOUND",
  "TRIP_CREATED",
  "CONFIRMED",
  "FAILED",
  "COMPENSATING",
]);

export const vehicleTypeEnum = pgEnum("vehicle_type", ["ECONOMY", "PREMIUM"]);

export const bookingSagas = pgTable("booking_sagas", {
  id: uuid("id").primaryKey().defaultRandom(),
  rideId: uuid("ride_id").notNull().unique(),
  riderId: uuid("rider_id").notNull(),
  status: sagaStatusEnum("status").notNull().default("STARTED"),
  riderEmail: varchar("rider_email", { length: 255 }),
  driverEmail: varchar("driver_email", { length: 255 }),

  // filled after fare.calculate.reply
  estimatedFare: numeric("estimated_fare", { precision: 10, scale: 2 }),
  distanceKm: numeric("distance_km", { precision: 10, scale: 2 }),
  durationMins: integer("duration_mins"),

  // filled after driver.find.reply
  driverId: uuid("driver_id"),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull().default("ECONOMY"),

  // filled after trip.create.reply
  tripId: uuid("trip_id"),

  // ride request details
  pickupAddress: text("pickup_address").notNull(),
  pickupLat: numeric("pickup_lat", { precision: 10, scale: 7 }).notNull(),
  pickupLng: numeric("pickup_lng", { precision: 10, scale: 7 }).notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  dropoffLat: numeric("dropoff_lat", { precision: 10, scale: 7 }).notNull(),
  dropoffLng: numeric("dropoff_lng", { precision: 10, scale: 7 }).notNull(),

  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
