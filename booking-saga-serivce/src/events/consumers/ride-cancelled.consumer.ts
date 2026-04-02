import { createConsumer } from '@cab/messaging'
import { Topics } from '@cab/events'
import { SagaService } from '../../modules/saga/saga.service'
import { logger } from '../../config/logger'

const sagaService = new SagaService()

export const startRideCancelledConsumer = async () => {
  await createConsumer({
    groupId:      'booking-saga-ride-cancelled',
    topic:        Topics.RIDE_CANCELLED,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'ride.cancelled.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const { data } = value
      await sagaService.handleRideCancelled(data.rideId)
      logger.info({ rideId: data.rideId }, 'Ride cancellation processed by saga')
    }
  })
}