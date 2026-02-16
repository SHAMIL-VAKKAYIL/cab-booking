import pino from 'pino';

import dotenv from 'dotenv';

dotenv.config();


export const createLogger = (serviceName: string) => {
  return pino({
    level: process.env.LOG_LEVEL || 'info',
    base: { service: serviceName },

    ...(process.env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true }
      }
    })
  });
};