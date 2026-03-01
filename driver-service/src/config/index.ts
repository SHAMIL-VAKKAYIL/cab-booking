import dotenv from 'dotenv'
dotenv.config()

export const config ={
    port :parseInt(process.env.PORT || '4000' ,10),
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
        host: process.env.DB_HOST! ,
        database: process.env.DB_NAME! ,
        user: process.env.DB_USER! ,
        password: process.env.DB_PASSWORD! ,
        port: Number(process.env.DB_PORT),
    },
    
}