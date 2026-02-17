import { logger } from "../../config/logger";
import { LoginRequest, RegisterRequest } from "../../types/authType";
import express from 'express'
import { AuthService } from "./auth.service";



export const registerHandler = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, role }: RegisterRequest = req.body

        const userRegister = await AuthService.prototype.register({ email, password, role })

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        logger.error({ error }, 'User registration failed');
        res.status(500).json({ error: 'Failed to register user' });
    }

}

export const loginHandler = (req: express.Request, res: express.Response) => {
    try {
        const { email, password }: LoginRequest = req.body

        // const user = pg
        // if (!user) {
        //     return res.status(400).json({ error: 'Invalid email or password' })
        // }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        logger.error({ error }, 'User login failed');
        res.status(500).json({ error: 'Failed to login user' });
    }
}

