import { createClient, RedisClientType } from "redis";
import { logger } from "../config/logger";
import { config } from "../config";

const client = createClient({ url: config.redis.url });

client.on("connect", () => {
  logger.info("Redis connected");
});
client.on("error", (err) => {
  logger.error({ err }, "Redis error");
});
client.on("reconnecting", () => {
  logger.info("Redis reconnecting");
});
client.on("end", () => {
  logger.info("Redis disconnected");
});

export const connectRedis = async () => {
  await client.connect();
};

export const redis = client as unknown as RedisClientType;

// Redis key constants
export const DRIVER_LOCATIONS_KEY = "driver:locations";
export const DRIVER_AVAILABLE_KEY = "driver:available";
export const DRIVER_VEHICLE_KEY = (type: string) => `driver:vehicle:${type}`;
