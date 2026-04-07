import {
  pgTable, uuid, varchar, text,
  timestamp, pgEnum, numeric, integer
} from 'drizzle-orm/pg-core'

export const tripStatusEnum = pgEnum('trip_status', [
  'REQUESTED',
  'MATCHED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
])

export const vehicleTypeEnum = pgEnum('vehicle_type', [
  'ECONOMY',
  'PREMIUM'
])

export const trips = pgTable('trips', {
  id:             uuid('id').primaryKey().defaultRandom(),
  riderId:        uuid('rider_id').notNull(),
  riderEmail:     varchar('rider_email', { length: 255 }).notNull(),
  driverId:       uuid('driver_id'),
  status:         tripStatusEnum('status').notNull().default('REQUESTED'),
  pickupAddress:  text('pickup_address').notNull(),
  pickupLat:      numeric('pickup_lat', { precision: 10, scale: 7 }).notNull(),
  pickupLng:      numeric('pickup_lng', { precision: 10, scale: 7 }).notNull(),
  dropoffAddress: text('dropoff_address').notNull(),
  dropoffLat:     numeric('dropoff_lat', { precision: 10, scale: 7 }).notNull(),
  dropoffLng:     numeric('dropoff_lng', { precision: 10, scale: 7 }).notNull(),
  vehicleType:    vehicleTypeEnum('vehicle_type').notNull().default('ECONOMY'),
  estimatedFare:  numeric('estimated_fare', { precision: 10, scale: 2 }),
  finalFare:      numeric('final_fare', { precision: 10, scale: 2 }),
  distanceKm:     numeric('distance_km', { precision: 10, scale: 2 }),
  durationMins:   integer('duration_mins'),
  cancelReason:   text('cancel_reason'),
  cancelledBy:    varchar('cancelled_by', { length: 20 }),
  startedAt:      timestamp('started_at', { withTimezone: true }),
  completedAt:    timestamp('completed_at', { withTimezone: true }),
  cancelledAt:    timestamp('cancelled_at', { withTimezone: true }),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})