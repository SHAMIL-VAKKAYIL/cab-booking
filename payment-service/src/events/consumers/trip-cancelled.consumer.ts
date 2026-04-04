import { createConsumer } from "@cab/messaging";
import { Topics } from "@cab/events";
import { PaymentService } from "../../modules/payments/payment.service";
import { logger } from "../../config/logger";

const paymentService = new PaymentService();

export const startTripCancelledConsumer = async () => {
    await createConsumer({
        groupId: "payment-service-trip-cancelled",
        topic: Topics.TRIP_CANCELLED,
        fromBeginning: false,
        retries: 3,
        dlqTopic: "trip.cancelled.dlq",
        retryDelayMs: 1000,
        eachMessage: async ({ key, value }) => {
            logger.info({ key, value }, "Received TRIP_CANCELLED event");
            if (!value) return;
            const { data } = value;
            const { tripId, riderId, reason } = data;
            if (!tripId || !riderId || !reason) {
                logger.error({ data }, "trip.cancelled missing required fields, skipping");
                return;
            }

            await paymentService.refundPayment({
                tripId,
                reason: reason ?? 'TRIP_CANCELLED',
            });
            logger.info({ tripId }, "Payment refund processed from trip.cancelled");
        }
    })
}