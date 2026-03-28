import { createConsumer } from '@cab/messaging'
import { Topics, DriverFindCommandEvent } from '@cab/events'
import { MatchingService } from '../../modules/matching/matching.service'
import { publishDriverFindReply } from '../producers/matching.producer'
import { logger } from '../../config/logger'

const matchingService = new MatchingService()

export const startDriverFindConsumer = async () => {
  await createConsumer({
    groupId:      'matching-service-driver-find',
    topic:        Topics.DRIVER_FIND_COMMAND,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'driver.find.command.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const event = value as DriverFindCommandEvent
      const {
        correlationId,
        rideId,
        riderId,
        pickupLat,
        pickupLng,
        vehicleType,
        radiusKm
      } = event.data

      try {
        const driverId = await matchingService.findNearestDriver({
          correlationId,
          rideId,
          riderId,
          pickupLat,
          pickupLng,
          vehicleType,
          radiusKm: radiusKm ?? 5
        })

        if (!driverId) {
          await publishDriverFindReply({
            correlationId,
            rideId,
            success: false,
            reason:  'No available drivers found',
          })
          return
        }

        // mark driver as busy before replying
        await matchingService.markDriverBusy(driverId, vehicleType)

        await publishDriverFindReply({
          correlationId,
          rideId,
          success:  true,
          driverId,
        })

        logger.info({ correlationId, rideId, driverId }, 'Driver matched successfully')

      } catch (error) {
        logger.error({ error, correlationId }, 'Failed to find driver')

        await publishDriverFindReply({
          correlationId,
          rideId,
          success: false,
          reason:  (error as Error).message,
        })
      }
    }
  })
}