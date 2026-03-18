import { createConsumer } from '@cab/messaging'
import { Topics } from '@cab/events'
import { TripService } from '../../modules/trip/trip.service'
import { logger } from '../../config/logger'

const tripService = new TripService()

export const startRideCancelledConsumer = async () => {
    await createConsumer({
        groupId: 'trip-service-ride-cancelled',
        topic: Topics.RIDE_CANCELLED,
        retries: 3,
        retryDelayMs: 1000,
        dlqTopic: 'ride.cancelled.dlq',

        eachMessage: async ({ value }: { value: any }) => {
            if (!value) return

            const { data } = value
            const { rideId, reason } = data

            await tripService.cancelTrip({
                tripId: rideId,
                reason: reason ?? 'RIDER_CANCELLED',
                cancelledBy: 'RIDER',
            })

            logger.info({ rideId }, 'Trip cancelled from ride.cancelled event')
        }
    })
}