import { createConsumer } from '@cab/messaging'
import { Topics } from '@cab/events'
import { MatchingService } from '../../modules/matching/matching.service'
import { logger } from '../../config/logger'

const matchingService = new MatchingService()

export const startTripCancelledConsumer = async () => {
  await createConsumer({
    groupId:      'matching-service-trip-cancelled',
    topic:        Topics.TRIP_CANCELLED,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'trip.cancelled.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const { data } = value
      const { driverId, vehicleType } = data

      if (!driverId) {
        logger.warn('trip.cancelled has no driverId, skipping release')
        return
      }

      await matchingService.releaseDriver(driverId, vehicleType ?? 'ECONOMY')
      logger.info({ driverId }, 'Driver released after trip cancellation')
    }
  })
}