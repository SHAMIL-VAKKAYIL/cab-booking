import { createConsumer } from '@cab/messaging'
import { Topics } from '@cab/events'
import { SagaService } from '../../modules/saga/saga.service'
import { logger } from '../../config/logger'

const sagaService = new SagaService()

export const startRideRequestedConsumer = async () => {
  await createConsumer({
    groupId:      'booking-saga-ride-requested',
    topic:        Topics.RIDE_REQUESTED,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'ride.requested.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const { data } = value

      await sagaService.startSaga({
        rideId:         data.rideId,
        riderId:        data.riderId,
        pickupAddress:  data.pickupAddress,
        pickupLat:      data.pickupLat,
        pickupLng:      data.pickupLng,
        dropoffAddress: data.dropoffAddress,
        dropoffLat:     data.dropoffLat,
        dropoffLng:     data.dropoffLng,
        vehicleType:    data.vehicleType,
      })

      logger.info({ rideId: data.rideId }, 'Saga started from ride.requested')
    }
  })
}