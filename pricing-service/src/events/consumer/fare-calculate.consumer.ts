import { createConsumer } from '@cab/messaging'
import { Topics, FareCalculateCommandEvent } from '@cab/events'
import { PricingService } from '../../modules/pricing/pricing.service'
import { publishFareCalculateReply } from '../producer/pricing.producer'
import { logger } from '../../config/logger'

const pricingService = new PricingService()

export const startFareCalculateConsumer = async () => {
    await createConsumer({
        groupId: 'pricing-service-fare-calculate',
        topic: Topics.FARE_CALCULATE_COMMAND,
        fromBeginning: false,
        retries: 3,
        retryDelayMs: 1000,
        dlqTopic: 'fare.calculate.command.dlq',

        eachMessage: async ({ value }) => {
            if (!value) return

            const event = value as FareCalculateCommandEvent
            const {
                correlationId,
                rideId,
                pickupLat,
                pickupLng,
                dropoffLat,
                dropoffLng,
                vehicleType
            } = event.data

            try {
                const result = pricingService.calculateFare({
                    correlationId,
                    rideId,
                    pickupLat,
                    pickupLng,
                    dropoffLat,
                    dropoffLng,
                    vehicleType
                })

                await publishFareCalculateReply({
                    correlationId,
                    rideId,
                    success: true,
                    fare: result.fare,
                    distanceKm: result.distanceKm,
                    durationMins: result.durationMins,
                })

                logger.info({ correlationId, rideId, fare: result.fare }, 'Fare calculated and replied')

            } catch (error) {
                logger.error({ error, correlationId, rideId }, 'Failed to calculate fare')

                await publishFareCalculateReply({
                    correlationId,
                    rideId,
                    success: false,
                    reason: (error as Error).message,
                })
            }
        }
    })
}