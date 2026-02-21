import jwt, { SignOptions, Secret } from 'jsonwebtoken'

import { logger } from '../config/logger'
import { config } from '../config'

export interface TokenPayload {
    userId: string
    email: string
    role:string
}

interface RefreshTokenPayload {
    userId: string
    role:string,
    email?: string
}

const refreshTokenSecret:Secret = config.jwt.refreshSecret 
const accessTokenSecret:Secret = config.jwt.accessSecret 

const refreshTokenExpiry = config.jwt.refreshExpiry 
const accessTokenExpiry = config.jwt.accessExpiry 


export const createAccessToken = (payload: TokenPayload) => {
    return jwt.sign(payload, accessTokenSecret as string, { expiresIn: accessTokenExpiry } as SignOptions) 
}

export const createRefreshToken = (payload: TokenPayload) => {
    return jwt.sign(payload, refreshTokenSecret as string, { expiresIn: refreshTokenExpiry } as SignOptions)
}

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, accessTokenSecret) as TokenPayload
    } catch (err) {
        logger.error({ err }, 'Invalid access token')
        return null
    }
}

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, refreshTokenSecret) as TokenPayload

    } catch (error) {
        logger.error({ error }, 'Invalid refresh token')
        return null
    }
}