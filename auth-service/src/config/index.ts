import dotenv from 'dotenv'

dotenv.config()

export const config = {
    port: parseInt(process.env.PORT || '4000', 10),

    db: {
        host: process.env.DB_HOST! ,
        database: process.env.DB_NAME! ,
        user: process.env.DB_USER! ,
        password: process.env.DB_PASSWORD! ,
        port: Number(process.env.DB_PORT),
    },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'supersecret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'supersecret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
}