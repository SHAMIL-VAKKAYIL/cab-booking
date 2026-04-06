import { createConsumer } from "@cab/messaging";
import { Topics, BookingConfirmedEvent } from "@cab/events";
import { NotificationService } from "../../modules/notification/notificaiton.service";
import { logger } from "../../config/logger";

const notificationService = new NotificationService();

export const startBookingConfirmedConsumer = async () => {
  await createConsumer({
    groupId: "notification-service-booking-confirmed",
    topic: Topics.BOOKING_CONFIRMED,
    fromBeginning: false,
    retries: 3,
    retryDelayMs: 1000,
    dlqTopic: "booking.confirmed.dlq",

    eachMessage: async ({ value }) => {
      if (!value) return;

      const event = value as BookingConfirmedEvent;
      const {
        tripId,
        riderEmail,
        driverEmail,
        estimatedFare,
        pickupAddress,
        dropoffAddress,
        vehicleType,
        riderId,
        driverId,
      } = event.data;

      await notificationService.sendBookingConfirmedRider({
        riderId,
        riderEmail,
        driverId,
        tripId,
        estimatedFare,
        pickupAddress,
        dropoffAddress,
        vehicleType,
      });

      logger.info({ tripId }, "Booking confirmed notifications sent");
    },
  });
};
