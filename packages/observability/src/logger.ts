import pino from 'pino';

import dotenv from 'dotenv';

dotenv.config();

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'production' ? undefined : {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    },
});