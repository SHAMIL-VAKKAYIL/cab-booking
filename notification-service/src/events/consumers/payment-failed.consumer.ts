import { createConsumer } from "@cab/messaging";
import { Topics, PaymentFailedEvent } from "@cab/events";
import { NotificationService } from "../../modules/notification/notificaiton.service";
import { logger } from "../../config/logger";

const notificationService = new NotificationService();

export const startPaymentFailedConsumer = async () => {
  await createConsumer({
    groupId: "notification-service-payment-failed",
    topic: Topics.PAYMENT_FAILED,
    fromBeginning: false,
    retries: 3,
    retryDelayMs: 1000,
    dlqTopic: "payment.failed.dlq",

    eachMessage: async ({ value }) => {
      if (!value) return;

      const event = value as PaymentFailedEvent;
      const { tripId, riderEmail, reason } = event.data;

      await notificationService.sendPaymentFailed({
        riderEmail,
        tripId,
        reason,
      });

      logger.info({ tripId }, "Payment failed notification sent");
    },
  });
};
