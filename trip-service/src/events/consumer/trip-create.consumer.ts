import { createConsumer } from '@cab/messaging'
import { Topics, TripCreateCommandEvent } from '@cab/events'
import { TripService } from '../../modules/trip/trip.service'
import { publishTripCreateReply } from '../producer/trip.producer'
import { logger } from '../../config/logger'

const tripService = new TripService()

export const startTripCreateConsumer = async () => {
    await createConsumer({
        groupId: 'trip-service-create',
        topic: Topics.TRIP_CREATE_COMMAND,
        retries: 3,
        retryDelayMs: 1000,
        dlqTopic: 'trip.create.command.dlq',

        eachMessage: async ({ value }: { value: any }) => {
            if (!value) return

            const event = value as TripCreateCommandEvent
            const { correlationId } = event.data

            try {
                await tripService.createTrip({
                    correlationId,
                    riderId: event.data.riderId,
                    riderEmail: event.data.riderEmail,
                    driverId: event.data.driverId,
                    pickupAddress: event.data.pickupAddress,
                    pickupLat: event.data.pickupLat,
                    pickupLng: event.data.pickupLng,
                    dropoffAddress: event.data.dropoffAddress,
                    dropoffLat: event.data.dropoffLat,
                    dropoffLng: event.data.dropoffLng,
                    vehicleType: event.data.vehicleType,
                    estimatedFare: event.data.estimatedFare,
                })
            } catch (error) {
                logger.error({ error, correlationId }, 'Failed to create trip')


                await publishTripCreateReply({
                    correlationId,
                    tripId: '',
                    success: false,
                    reason: (error as Error).message,
                })
            }
        }
    })
}