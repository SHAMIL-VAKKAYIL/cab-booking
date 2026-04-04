import {
  pgTable, uuid, varchar,
  timestamp, pgEnum, numeric, text
} from 'drizzle-orm/pg-core'

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'SUCCESS',
  'FAILED',
  'REFUNDED'
])

export const payments = pgTable('payments', {
  id:            uuid('id').primaryKey().defaultRandom(),
  tripId:        uuid('trip_id').notNull().unique(),
  riderId:       uuid('rider_id').notNull(),
  driverId:      uuid('driver_id').notNull(),
  amount:        numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency:      varchar('currency', { length: 10 }).notNull().default('INR'),
  status:        paymentStatusEnum('status').notNull().default('PENDING'),
  transactionId: varchar('transaction_id', { length: 255 }),
  failureReason: text('failure_reason'),
  processedAt:   timestamp('processed_at', { withTimezone: true }),
  createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})