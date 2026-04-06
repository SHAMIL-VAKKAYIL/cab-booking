import { createConsumer } from "@cab/messaging";
import { Topics, TripStartedEvent } from "@cab/events";
import { NotificationService } from "../../modules/notification/notificaiton.service";
import { logger } from "../../config/logger";

const notificationService = new NotificationService();

export const startTripStartedConsumer = async () => {
  await createConsumer({
    groupId: "notification-service-trip-started",
    topic: Topics.TRIP_STARTED,
    fromBeginning: false,
    retries: 3,
    retryDelayMs: 1000,
    dlqTopic: "trip.started.dlq",

    eachMessage: async ({ value }) => {
      if (!value) return;

      const event = value as TripStartedEvent;
      const { tripId, riderEmail } = event.data;

      await notificationService.sendTripStarted({ riderEmail, tripId });
      logger.info({ tripId }, "Trip started notification sent");
    },
  });
};
