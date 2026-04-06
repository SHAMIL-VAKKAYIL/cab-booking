import { app } from "./app";
import { config } from "./config";
import { logger } from "./config/logger";
import { verifyMailer } from "./config/mailer";
import { connectProducer } from "@cab/messaging";
import { startBookingConfirmedConsumer } from "./events/consumers/booking-confirmed.consumer";
import { startBookingFailedConsumer } from "./events/consumers/booking-failed.consumer";
import { startTripStartedConsumer } from "./events/consumers/trip-started.consumer";
import { startTripCompletedConsumer } from "./events/consumers/trip-completed.consumer";
import { startTripCancelledConsumer } from "./events/consumers/trip-cancelled.consumer";
import { startPaymentSuccessConsumer } from "./events/consumers/payment-success.consumer";
import { startPaymentFailedConsumer } from "./events/consumers/payment-failed.consumer";


const PORT = config.port;
const start = async () => {
  try {
    await Promise.all([
      verifyMailer(),
      connectProducer(),
      startBookingConfirmedConsumer(),
      startBookingFailedConsumer(),
      startTripStartedConsumer(),
      startTripCompletedConsumer(),
      startTripCancelledConsumer(),
      startPaymentSuccessConsumer(),
      startPaymentFailedConsumer(),
    ]);
    logger.info("All Kafka consumers,mailer and producer started'");
    app.listen(PORT, () => {
      logger.info(`server runnig on ${PORT}`);
    });
  } catch (error) {
    logger.error({ error }, "faild to start server");
    process.exit(1);
  }
};

start();
