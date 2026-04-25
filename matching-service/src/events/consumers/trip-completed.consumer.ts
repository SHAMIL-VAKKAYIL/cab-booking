import { createConsumer } from '@cab/messaging'
import { Topics } from '@cab/events'
import { MatchingService } from '../../modules/matching/matching.service'
import { logger } from '../../config/logger'

const matchingService = new MatchingService()

export const startTripCompletedConsumer = async () => {
  await createConsumer({
    groupId:      'matching-service-trip-completed',
    topic:        Topics.TRIP_COMPLETED,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'trip.completed.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const { data } = value
      const { driverId, vehicleType } = data

      if (!driverId) {
        logger.warn('trip.completed has no driverId, skipping release')
        return
      }

      await matchingService.releaseDriver(driverId, vehicleType ?? 'ECONOMY')
      logger.info({ driverId }, 'Driver released after trip completion')
    }
  })
}
