import {
    pgTable,
    uuid,
    varchar,
    boolean,
    timestamp,
    pgEnum,
    numeric,
    integer
} from "drizzle-orm/pg-core";


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

export const vehicleTypeEnum = pgEnum("vehicle_type", ["ECONOMY", "PREMIUM"]);

export const driver = pgTable("drivers", {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }),
    user_id: uuid('user_id').notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }),
    //! license details
    licenseNumber: varchar('license_number', { length: 100 }),
    licenseExpiry: timestamp('license_expiry', { withTimezone: true }),
    //! vehicle details
    vehicleModel: varchar('vehicle_model', { length: 50 }),
    vehiclePlate: varchar('vehicle_plate', { length: 50 }),
    vehicleType: vehicleTypeEnum("vehicle_type"),


    status: driverStatusEnum('status').default('APPROVED').notNull(),
    availability: driverAvailabilityEnum('availability').default('OFFLINE').notNull(),
    isActive: boolean("is_active").default(true).notNull(),

    averageRating: numeric("average_rating", { precision: 3, scale: 2 }).notNull().default("0"),
    totalRatings: integer("total_ratings").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

})