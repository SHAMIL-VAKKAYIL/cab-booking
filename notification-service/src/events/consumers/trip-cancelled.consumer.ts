import { createConsumer } from "@cab/messaging";
import { Topics, TripCancelledEvent } from "@cab/events";
import { NotificationService } from "../../modules/notification/notificaiton.service";
import { logger } from "../../config/logger";

const notificationService = new NotificationService();

export const startTripCancelledConsumer = async () => {
  await createConsumer({
    groupId: "notification-service-trip-cancelled",
    topic: Topics.TRIP_CANCELLED,
    fromBeginning: false,
    retries: 3,
    retryDelayMs: 1000,
    dlqTopic: "trip.cancelled.notification.dlq",

    eachMessage: async ({ value }) => {
      if (!value) return;

      const event = value as TripCancelledEvent;
      const { tripId, riderEmail, reason } = event.data;

      await notificationService.sendTripCancelled({
        riderEmail,
        tripId,
        reason,
      });

      logger.info({ tripId }, "Trip cancelled notification sent");
    },
  });
};
