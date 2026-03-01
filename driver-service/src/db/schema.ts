import {
    pgTable,
    uuid,
    varchar,
    boolean,
    timestamp,
    pgEnum
} from "drizzle-orm/pg-core";

/**
 * Driver status enum
 */
export const driverStatusEnum = pgEnum("driver_status", [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "SUSPENDED",
]);

export const driverAvailabilityEnum = pgEnum("driver_availability", [
    "OFFLINE",
    "ONLINE",
    "ON_TRIP",
]);

export const Driver = pgTable("drivers", {
    id: uuid('id').primaryKey().defaultRandom(),

    user_id: uuid('user_id').notNull(),
    //! license details
    licenseNumber: varchar('license_number', { length: 100 }).notNull(),
    licenseExpiry: timestamp('license_expiry', { withTimezone: true }).notNull(),
    //! vehicle details
    vehicleModel: varchar('vehicle_model', { length: 50 }).notNull(),
    vehiclePlate: varchar('vehicle_plate', { length: 50 }).notNull(),


    status: driverStatusEnum('status').default('APPROVED').notNull(),

    availablity: driverAvailabilityEnum('availablity').default('OFFLINE').notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

})