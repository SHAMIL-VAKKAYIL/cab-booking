import { createConsumer } from '@cab/messaging'
import { Topics } from '@cab/events'
import { MatchingService } from '../../modules/matching/matching.service'
import { logger } from '../../config/logger'

const matchingService = new MatchingService()

export const startDriverOfflineConsumer = async () => {
  await createConsumer({
    groupId:      'matching-service-driver-offline',
    topic:        Topics.DRIVER_OFFLINE,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'driver.offline.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const { data } = value
      const { driverId, vehicleType } = data

      await matchingService.removeDriverFromPool(driverId, vehicleType)
      logger.info({ driverId }, 'Driver removed from matching pool')
    }
  })
}