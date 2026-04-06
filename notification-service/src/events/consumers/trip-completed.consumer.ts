import { createConsumer } from "@cab/messaging";
import { Topics, TripCompletedEvent } from "@cab/events";
import { NotificationService } from "../../modules/notification/notificaiton.service";
import { logger } from "../../config/logger";

const notificationService = new NotificationService();

export const startTripCompletedConsumer = async () => {
  await createConsumer({
    groupId: "notification-service-trip-completed",
    topic: Topics.TRIP_COMPLETED,
    fromBeginning: false,
    retries: 3,
    retryDelayMs: 1000,
    dlqTopic: "trip.completed.notification.dlq",

    eachMessage: async ({ value }) => {
      if (!value) return;

      const event = value as TripCompletedEvent;
      const {
        tripId,
        riderEmail,
        fare,
        distanceKm,
        durationMins,
        pickupAddress,
        dropoffAddress,
      } = event.data;

      await notificationService.sendTripCompleted({
        riderEmail,
        tripId,
        fare,
        distanceKm,
        durationMins,
        pickupAddress,
        dropoffAddress,
      });

      logger.info({ tripId }, "Trip completed notification sent");
    },
  });
};
