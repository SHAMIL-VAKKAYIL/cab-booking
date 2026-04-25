"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.text)("password_hash").notNull(),
    role: (0, pg_core_1.varchar)("role", { length: 20 }).default("rider"),
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
