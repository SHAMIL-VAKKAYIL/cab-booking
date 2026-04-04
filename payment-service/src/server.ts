import { app } from "./app";
import { config } from "./config";
import { logger } from "./config/logger";

import { pool } from "./db/pool";
import { connectProducer } from "@cab/messaging";
import { startTripCompletedConsumer } from './events/consumers/trip-completed.consumer'
import { startTripCancelledConsumer } from './events/consumers/trip-cancelled.consumer'

const PORT = config.port;
const start = async() => {
  try {


    await Promise.all([
      pool.connect(),
      connectProducer(),
      startTripCompletedConsumer(),
      startTripCancelledConsumer(),
    ]).then(() => {
      logger.info({}, "Connected to database and Kafka, starting server...");
    }).catch((err) => {
      logger.error({ err }, "Failed to connect to database or Kafka");
      process.exit(1);
    });
    app.listen(PORT, () => {
      logger.info({}, `server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ error }, "faild to start server");
  }
};

start();
