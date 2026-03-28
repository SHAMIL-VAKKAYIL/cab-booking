import { createConsumer } from '@cab/messaging'
import { Topics, DriverReleaseCommandEvent } from '@cab/events'
import { MatchingService } from '../../modules/matching/matching.service'
import { logger } from '../../config/logger'

const matchingService = new MatchingService()

export const startDriverReleaseConsumer = async () => {
  await createConsumer({
    groupId:      'matching-service-driver-release',
    topic:        Topics.DRIVER_RELEASE_COMMAND,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'driver.release.command.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const event = value as DriverReleaseCommandEvent
      const { driverId } = event.data

      const vehicleType = event.data.vehicleType ?? 'ECONOMY'

      await matchingService.releaseDriver(driverId, vehicleType)
      logger.info({ driverId }, 'Driver released from matching pool')
    }
  })
}