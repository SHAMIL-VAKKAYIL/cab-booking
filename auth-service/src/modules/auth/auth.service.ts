import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { logger } from "../../config/logger.js";
import { RegisterRequest } from "../../types/authType.js";


export class AuthService {
    async register(registerRequest: RegisterRequest,) {
        try {
            const existingUser = await db.select().from(users).where(eq(users.email, registerRequest.email)).execute()
            if (existingUser.length > 0) {
                logger.warn({ email: registerRequest.email }, 'Attempt to register with an existing email');
                return null
            }
            const salt = await bcrypt.genSalt(10)
            const passwordHash = await bcrypt.hash(registerRequest.password, salt)

            const newUser = await db.insert(users).values({
                email: registerRequest.email,
                passwordHash: passwordHash,
                role: registerRequest.role,
            }).returning()
      return newUser[0]
        } catch (error) {
            logger.error({ error }, 'User registration failed');
            return null
        }
    };

    async login(email: string, password: string) {
        try {
            const existingUser = await db.select().from(users).where(eq(users.email, email)).execute()
            if (existingUser.length === 0) {
                logger.warn({ email }, 'Attempt to login with non-existent email');
                return null
            }

            const user = existingUser[0]
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
            if (!isPasswordValid) {
                logger.warn({ email }, 'Attempt to login with incorrect password');
                return null
            }
            return user

        } catch (error) {
            logger.error({ error }, 'User login failed');
            return null
        }

    }
}