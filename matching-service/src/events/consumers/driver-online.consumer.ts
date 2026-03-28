import { createConsumer } from '@cab/messaging'
import { Topics } from '@cab/events'
import { MatchingService } from '../../modules/matching/matching.service'
import { logger } from '../../config/logger'

const matchingService = new MatchingService()

export const startDriverOnlineConsumer = async () => {
  await createConsumer({
    groupId:      'matching-service-driver-online',
    topic:        Topics.DRIVER_ONLINE,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'driver.online.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const { data } = value
      const { driverId, vehicleType, lat, lng } = data

      await matchingService.addDriverToPool({
        driverId,
        lat,
        lng,
        vehicleType
      })

      logger.info({ driverId }, 'Driver added to matching pool')
    }
  })
}