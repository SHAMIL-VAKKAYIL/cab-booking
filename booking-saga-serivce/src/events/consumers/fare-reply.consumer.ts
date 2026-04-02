import { createConsumer } from '@cab/messaging'
import { Topics } from '@cab/events'
import { SagaService } from '../../modules/saga/saga.service'
import { logger } from '../../config/logger'

const sagaService = new SagaService()

export const startFareReplyConsumer = async () => {
  await createConsumer({
    groupId:      'booking-saga-fare-reply',
    topic:        Topics.FARE_CALCULATE_REPLY,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'fare.calculate.reply.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const { data } = value
      const { correlationId, rideId, success, fare, distanceKm, durationMins, reason } = data

      if (!success) {
        logger.warn({ rideId, reason }, 'Fare calculation failed')
        await sagaService.failSaga({ rideId, reason: reason ?? 'Fare calculation failed' })
        return
      }

      await sagaService.handleFareCalculated({
        rideId,
        estimatedFare: fare!,
        distanceKm:    distanceKm!,
        durationMins:  durationMins!,
      })

      logger.info({ rideId, fare }, 'Fare reply processed')
    }
  })
}