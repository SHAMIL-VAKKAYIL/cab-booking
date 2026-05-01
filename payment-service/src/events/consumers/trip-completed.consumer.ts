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
            const { tripId, driverId, riderId, fare, riderEmail } = data
            
            // Validate all required fields
            if (!tripId) {
                logger.error({ data }, 'trip.completed missing tripId, skipping')
                return
            }
            if (!riderId) {
                logger.error({ tripId, data }, 'trip.completed missing riderId, skipping')
                return
            }
            if (!driverId) {
                logger.error({ tripId, data }, 'trip.completed missing driverId, skipping')
                return
            }
            if (fare === undefined || fare === null) {
                logger.error({ tripId, data }, 'trip.completed missing fare, skipping')
                return
            }

            const amount = Number(fare)
            if (isNaN(amount) || amount <= 0) {
                logger.error({ tripId, fare, amount }, 'trip.completed has invalid fare amount, skipping')
                return
            }

            try {
                const payment = await paymentService.processPayment({
                    tripId,
                    riderId,
                    riderEmail,
                    driverId,
                    amount,
                })

                if (payment.status !== "SUCCESS") {
                    logger.error({ tripId, paymentId: payment.id, status: payment.status }, 'Payment service returned failed status')
                    return
                }

                logger.info({ tripId, amount, paymentId: payment.id }, 'Payment processed successfully from trip.completed')
            } catch (error) {
                logger.error({ tripId, error: (error as Error).message }, 'Failed to process payment from trip.completed')
            }
        }

    })
}