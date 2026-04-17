import { app } from "./app";
import { logger } from "./config/logger";
import { config } from "./config";
import { pool } from "./db/pool";
import { connectProducer } from "@cab/messaging";
import { startRideRequestedConsumer } from "./events/consumers/ride-requested.consumer";
import { startFareReplyConsumer } from "./events/consumers/fare-reply.consumer";
import { startDriverReplyConsumer } from "./events/consumers/driver-reply.consumer";
import { startTripReplyConsumer } from "./events/consumers/trip-reply.consumer";
import { startRideCancelledConsumer } from "./events/consumers/ride-cancelled.consumer";

const start = async () => {
  try {
    await pool.connect();
    logger.info("Database connected");

    await connectProducer();
    logger.info("Kafka producer connected");

    await startRideRequestedConsumer();
    await startFareReplyConsumer();
    await startDriverReplyConsumer();
    await startTripReplyConsumer();
    await startRideCancelledConsumer();

    logger.info("All Kafka consumers started");

    app.listen(config.port, () => {
      logger.info(`Booking saga service running on port ${config.port}`);
    });

  } catch (error) {
    logger.error({ error }, "Failed to start booking saga service");
    process.exit(1);
  }
};
start();
