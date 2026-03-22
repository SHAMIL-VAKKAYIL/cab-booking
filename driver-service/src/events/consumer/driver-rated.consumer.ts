import { createConsumer } from '@cab/messaging'
import { Topics } from '@cab/events'
import { DriverService } from '../../modules/driver/driver.service'
import { logger } from '../../config/logger'

const driverService = new DriverService()

export const startDriverRatedConsumer = async () => {
  await createConsumer({
    groupId:      'driver-service-rated',
    topic:        Topics.DRIVER_RATED,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'driver.rated.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const { data } = value
      const { driverId, score } = data

      if (!driverId || score === undefined) {
        logger.error({ value }, 'driver.rated event missing required fields, skipping')
        return
      }

      await driverService.updateRating({ driverId, score })
      logger.info({ driverId, score }, 'Driver rating updated from driver.rated event')
    }
  })
}