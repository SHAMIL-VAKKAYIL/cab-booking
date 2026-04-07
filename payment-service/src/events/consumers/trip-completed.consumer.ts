import { Topics } from '@cab/events'
import { createConsumer } from '@cab/messaging'
import { PaymentService } from '../../modules/payments/payment.service'
import { logger } from '../../config/logger'

const paymentService = new PaymentService()


export const startTripCompletedConsumer = async () => {
    await createConsumer({
        groupId: 'payment-service-trip-completed',
        topic: Topics.TRIP_COMPLETED,
        fromBeginning: false,
        retries: 3,
        dlqTopic: 'trip.completed.dlq',
        retryDelayMs: 1000,
        eachMessage: async ({ key, value }) => {
            logger.info({ key, value }, "Received TRIP_COMPLETED event");
            if (!value) return;
            const { data } = value
            const { tripId, driverId, riderId, amount, riderEmail } = data
            if (!tripId || !riderId || !driverId || !amount) {
                logger.error({ data }, 'trip.completed missing required fields, skipping')
                return
            }

            await paymentService.processPayment({
                tripId,
                riderId,
                riderEmail,
                driverId,
                amount: Number(amount),
            })
            logger.info({ tripId }, 'Payment processed from trip.completed')
        }

    })
}