import { createConsumer } from '@cab/messaging'
import { Topics, DriverBroadcastCommandEvent } from '@cab/events'
import { MatchingService } from '../../modules/matching/matching.service'
import { publishDriverFindReply, publishDriversBroadcast } from '../producers/matching.producer'
import { logger } from '../../config/logger'

const matchingService = new MatchingService()

export const startDriverFindingConsumer = async () => {
  await createConsumer({
    groupId: 'matching-service-driver-find',
    topic: Topics.DRIVER_BROADCAST_COMMAND,
    fromBeginning: false,
    retries: 3,
    retryDelayMs: 1000,
    dlqTopic: 'driver.find.command.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const event = value as DriverBroadcastCommandEvent
      const {
        correlationId,
        rideId,
        riderId,
        pickupLat,
        pickupLng,
        pickupAddress,
        estimatedFare,
        vehicleType,
        radiusKm,
      } = event.data

      try {
        const drivers = (await matchingService.findNearestDriver({
          correlationId,
          rideId,
          riderId,
          pickupLat,
          pickupLng,
          vehicleType,
          radiusKm: radiusKm ?? 5
        })) ?? []

        if (drivers.length === 0) {
          await publishDriverFindReply({
            correlationId,
            rideId,
            success: false,
            reason: 'No available drivers found',
          })
          return
        }

        await publishDriversBroadcast({
          correlationId,
          rideId,
          riderId,
          pickupLat,
          pickupLng,
          pickupAddress: pickupAddress,
          estimatedFare: estimatedFare,
          vehicleType,
          drivers,
          expiresIn: 20,
        })


        logger.info({ correlationId, rideId, count:drivers.length }, 'Driver matched successfully')

      } catch (error) {
        logger.error({ error, correlationId }, 'Failed to find driver')

        await publishDriverFindReply({
          correlationId,
          rideId,
          success: false,
          reason: (error as Error).message,
        })
      }
    }
  })
}