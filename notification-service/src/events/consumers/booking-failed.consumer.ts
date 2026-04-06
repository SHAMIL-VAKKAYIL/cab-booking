import { createConsumer } from "@cab/messaging";
import { Topics, BookingFailedEvent } from "@cab/events";
import { NotificationService } from "../../modules/notification/notificaiton.service";
import { logger } from "../../config/logger";

const notificationService = new NotificationService();

export const startBookingFailedConsumer = async () => {
  await createConsumer({
    groupId: "notification-service-booking-failed",
    topic: Topics.BOOKING_FAILED,
    fromBeginning: false,
    retries: 3,
    retryDelayMs: 1000,
    dlqTopic: "booking.failed.dlq",

    eachMessage: async ({ value }) => {
      if (!value) return;

      const event = value as BookingFailedEvent;
      const { rideId, riderEmail, reason } = event.data;

      await notificationService.sendBookingFailed({
        riderEmail,
        rideId,
        reason,
      });

      logger.info({ rideId }, "Booking failed notification sent");
    },
  });
};
