import express from 'express'
import { logger } from '../config/logger'
import { verifyAccessToken } from '../utils/token'


export const verifyUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        
        const accessToken = req.headers.authorization?.split(' ')[1] 
        if (!accessToken) {
            return res.status(401).json({ error: 'Access token missing' })
        }
        const payload = verifyAccessToken(accessToken)
        if (!payload) {
            return res.status(401).json({ error: 'Invalid access token' })
        }
        req.user = payload 
        next()
    } catch (error) {
        logger.error({ error }, 'Access token verification failed');
        return res.status(401).json({ error: 'Invalid access token' })
    }
    
}