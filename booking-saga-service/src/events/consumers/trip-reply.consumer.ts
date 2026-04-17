import { createConsumer } from "@cab/messaging";
import { Topics } from "@cab/events";
import { SagaService } from "../../modules/saga/saga.service";
import { logger } from "../../config/logger";

const sagaService = new SagaService();

export const startTripReplyConsumer = async () => {
  await createConsumer({
    groupId: "booking-saga-trip-reply",
    topic: Topics.TRIP_CREATE_REPLY,
    fromBeginning: false,
    retries: 3,
    retryDelayMs: 1000,
    dlqTopic: "trip.create.reply.dlq",

    eachMessage: async ({ value }) => {
      if (!value) return;

      const { data } = value;
      const { rideId, success, tripId, reason } = data;
      logger.info(data, "trip reply");
      if (!success) {
        logger.warn({ rideId, reason }, "Trip creation failed");
        await sagaService.failSaga({
          rideId,
          reason: reason ?? "Trip creation failed",
        });
        return;
      }

      await sagaService.handleTripCreated({ rideId, tripId: tripId! });
      logger.info({ rideId, tripId }, "Trip reply processed");
    },
  });
};
