import { logger } from "../../config/logger";
import { LoginRequest, RegisterRequest } from "../../types/authType";
import express from 'express'
import { AuthService } from "./auth.service";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../../utils/token";
import { config } from "../../config";



export const registerHandler = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, role }: RegisterRequest = req.body

        const userRegister = await AuthService.prototype.register({ email, password, role })

        logger.info({ email: userRegister.email }, 'User registered successfully');

        const accessToken = createAccessToken({ userId: userRegister.id, email: userRegister.email, role: userRegister.role || 'rider' })
        const refreshToken = createRefreshToken({ userId: userRegister.id, role: userRegister.role || 'rider', email: userRegister.email })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(201).json({ message: 'User registered successfully', accessToken });
    } catch (error) {
        logger.error({ error }, 'User registration failed');
        res.status(500).json({ error: 'Failed to register user' });
    }
}


export const loginHandler = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password }: LoginRequest = req.body

        // const user = pg
        // if (!user) {
        //     return res.status(400).json({ error: 'Invalid email or password' })
        // }
        const userExists = await AuthService.prototype.login(email, password)
        if (!userExists) {
            return res.status(400).json({ error: 'Invalid email or password' })
        }

        logger.info({ email }, 'User logged in successfully');

        const accessToken = await createAccessToken({ userId: userExists.id, email: userExists.email, role: userExists.role || 'rider' })
        const refreshToken = await createRefreshToken({ userId: userExists.id, role: userExists.role || 'rider', email: userExists.email })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(200).json({ message: 'Login successful', accessToken });
    } catch (error) {
        logger.error({ error }, 'User login failed');
        res.status(500).json({ error: 'Failed to login user' });
    }
}


export const refreshTokenHandler = async (req: express.Request, res: express.Response) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token missing' })
        }

        //! Verify refresh token and generate new access token
        const payload = verifyRefreshToken(refreshToken)
        if (!payload) {
            return res.status(401).json({ error: 'Invalid refresh token' })
        }
        const newAccessToken = createAccessToken({ userId: payload.userId, email: payload.email, role: payload.role })
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        logger.error({ error }, 'Token refresh failed');
        res.status(500).json({ error: 'Failed to refresh token' });
    }
}

export const logoutHandler = async (req: express.Request, res: express.Response) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'strict',
        })
        logger.info('User logged out successfully');
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        logger.error({ error }, 'User logout failed');
        res.status(500).json({ error: 'Failed to logout user' });
    }
}

