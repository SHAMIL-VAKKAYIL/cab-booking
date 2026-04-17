import { createConsumer } from '@cab/messaging'
import { Topics } from '@cab/events'
import { SagaService } from '../../modules/saga/saga.service'
import { logger } from '../../config/logger'

const sagaService = new SagaService()

export const startDriverReplyConsumer = async () => {
  await createConsumer({
    groupId:      'booking-saga-driver-reply',
    topic:        Topics.DRIVER_FIND_REPLY,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'driver.find.reply.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const { data } = value
      const { rideId, success, driverId, reason } = data

      if (!success) {
        logger.warn({ rideId, reason }, 'Driver find failed')
        await sagaService.failSaga({ rideId, reason: reason ?? 'No drivers available' })
        return
      }

      await sagaService.handleDriverFound({ rideId, driverId: driverId! })
      logger.info({ rideId, driverId }, 'Driver reply processed')
    }
  })
}