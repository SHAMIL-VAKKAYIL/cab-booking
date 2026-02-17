import { eq } from 'drizzle-orm'
import bycrypt from 'bcrypt'
import { db } from '../../db'
import { users } from '../../../drizzle/schema'
import { logger } from '../../config/logger'
import { RegisterRequest } from '../../types/authType'


export class AuthService {
    async register(registerRequest: RegisterRequest,) {
        try {
            const existingUser = await db.select().from(users).where(eq(users.email, registerRequest.email)).execute()
            if (existingUser.length > 0) {
                logger.warn({ email: registerRequest.email }, 'Attempt to register with an existing email');
                throw new Error('Email already in use')
            }
            const salt = await bycrypt.genSalt(10)
            const passwordHash = await bycrypt.hash(registerRequest.password, salt)

            const newUser = await db.insert(users).values({
                email: registerRequest.email,
                passwordHash: passwordHash,
                role: registerRequest.role,
            }).returning()

            return newUser[0]
        } catch (error) {
            logger.error({ error }, 'User registration failed');
            throw new Error('Failed to register user');
        }
    };

    async login(email: string, password: string) {
        try {
            const existingUser =await db.select().from(users).where(eq(users.email,email)).execute()
            if (existingUser.length === 0) {
                logger.warn({ email }, 'Attempt to login with non-existent email');
                throw new Error('Invalid email or password')
            }

            const user = existingUser[0]
            const isPasswordValid = await bycrypt.compare(password, user.passwordHash)
            if (!isPasswordValid) {
                logger.warn({ email }, 'Attempt to login with incorrect password');
                throw new Error('Invalid email or password')
            }
            return user
            
        } catch (error) {
            logger.error({ error }, 'User login failed');
            throw new Error('Failed to login user');
        }

    }
}