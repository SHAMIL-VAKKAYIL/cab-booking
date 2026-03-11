import { createConsumer } from '@cab/messaging';
import { Topics, UserCreatedEvent } from '@cab/events';
import { RiderService } from '../../modules/rider/rider.service';
import { logger } from '../../config/logger';
import { consumerMessage } from '../../types';

const riderService = new RiderService();

export const startTripCompletedConsumer = async () => {
  await createConsumer({
    groupId: 'rider-service-trip-completed',
    topic: Topics.TRIP_COMPLETED,
    fromBeginning: false,
    retries: 3,
    retryDelayMs: 1000,
    dlqTopic: 'trip.completed.dlq',
    eachMessage: async ({ value }: consumerMessage) => {
      if (!value) {
        logger.warn('Received empty trip.completed event, skipping');
        return;
      }
      const {
        tripId,
        riderId,
        driverId,
        pickupAddress,
        dropoffAddress,
        fare,
        distanceKm,
        durationMins,
        status,
        vehicleType,
        startedAt,
        completedAt,
      } = value;

      if (!tripId || !riderId || !driverId || !fare) {
        logger.error({ value }, 'trip.completed missing required fields, skipping');
        return;
      }

      await riderService.recordTrip({
        tripId,
        riderId,
        driverId,
        pickupAddress,
        dropoffAddress,
        fare: String(fare),
        distanceKm: distanceKm ? String(distanceKm) : undefined,
        durationMins: durationMins ?? undefined,
        status: status ?? 'COMPLETED',
        vehicleType: vehicleType ?? undefined,
        startedAt: startedAt ? new Date(startedAt) : undefined,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      });

      logger.info({ tripId, riderId }, 'Ride history recorded from trip.completed');
    },
  });
};
