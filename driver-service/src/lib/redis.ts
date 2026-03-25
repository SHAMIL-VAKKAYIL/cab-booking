import { createClient } from 'redis';
import { logger } from '../config/logger';
import { config } from '../config';

const client = createClient({ url: config.redis.url });

client.on('connect', () => {
    logger.info('Redis connected');
});

client.on('error', (err) => {
    logger.error({ err }, 'Redis error');
});

client.on('reconnecting', () => {
    logger.info('Redis reconnecting');
});

client.on('end', () => {
    logger.info('Redis disconnected');
});

export const connectRedis = async () => {
    await client.connect();
};

export const redis: any = client;
export const DRIVER_LOCATION_KEY = 'driver:locations';