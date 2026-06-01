import http from 'http'
import { app } from "./app";
import { config } from "./config";
import { logger } from "./config/logger";
import { pool } from "./db/pool";
import { connectRedis } from "./lib/redis";
import { connectProducer } from "@cab/messaging";
import { startUserCreatedSubscriber } from "./events/consumer/user-created.consumer";
import { startDriverRatedConsumer } from "./events/consumer/driver-rated.consumer";
import { notifyTripReqToDriver } from './events/consumer/driver-broadcast.consumer';
import { initSocket } from './lib/socket';


const server = http.createServer(app);

const start = async () => {
  try {


    await connectProducer();
    logger.info("Kafka producer connected");

    await pool.connect();
    logger.info("Database connected");

    await startUserCreatedSubscriber();
    await startDriverRatedConsumer();
    await notifyTripReqToDriver()
    logger.info("Kafka consumers started");

    await connectRedis();
    logger.info("Redis connected");
    
    initSocket(server)

    server.listen(config.port, () => {
      logger.info(`Driver service running on port ${config.port}`);
    });
  } catch (error) {
    logger.error({ error }, "Failed to start driver service");
    process.exit(1);
  }
};

start();
