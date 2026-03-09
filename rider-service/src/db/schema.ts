import {pgTable,uuid,varchar,boolean,timestamp,pgEnum}from 'drizzle-orm/pg-core'

export const riderStatusEnum = pgEnum('rider_status', ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'])

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