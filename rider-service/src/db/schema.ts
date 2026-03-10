import {pgTable,uuid,varchar,boolean,timestamp,pgEnum,text,numeric,integer}from 'drizzle-orm/pg-core'

export const riderStatusEnum = pgEnum('rider_status', ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'])

export const rideHistoryStatusEnum = pgEnum('ride_history_status', [
  'COMPLETED',
  'CANCELLED'
])


export const rider = pgTable('riders', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 15 }).notNull(),
    status: riderStatusEnum('status').default('PENDING').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})


export const rideHistory = pgTable('ride_history', {
  id:             uuid('id').primaryKey().defaultRandom(),
  riderId:        uuid('rider_id').notNull().references(() => rider.id),
  tripId:         uuid('trip_id').notNull().unique(), // from trip-service
  driverId:       uuid('driver_id').notNull(),
  pickupAddress:  text('pickup_address').notNull(),
  dropoffAddress: text('dropoff_address').notNull(),
  fare:           numeric('fare', { precision: 10, scale: 2 }).notNull(),
  distanceKm:     numeric('distance_km', { precision: 10, scale: 2 }),
  durationMins:   integer('duration_mins'),
  status:         rideHistoryStatusEnum('status').notNull(),
  vehicleType:    varchar('vehicle_type', { length: 20 }),
  startedAt:      timestamp('started_at', { withTimezone: true }),
  completedAt:    timestamp('completed_at', { withTimezone: true }),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})