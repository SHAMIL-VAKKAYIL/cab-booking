import { RideRequestedEvent, RideCancelledEvent, Topics } from '@cab/events';
import { publishEvent } from '@cab/messaging';
import { randomUUID } from 'crypto';

export const publishRideRequested = async (payload: {
  rideId: string;
  riderId: string;
  riderEmail: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  vehicleType: string;
}) => {
  const event: RideRequestedEvent = {
    event: 'RIDE_REQUESTED',
    data: {
      ...payload,
      occurredAt: new Date().toISOString(),
    },
    metadata: {
      correlationId: randomUUID(),
      source: 'rider-service',
      version: 1,
    },
  };
  await publishEvent(Topics.RIDE_REQUESTED, event);
};

export const publishRideCancelled = async (payload: {
  rideId: string;
  riderId: string;
  reason: string;
}) => {
  const event: RideCancelledEvent = {
    event: 'RIDE_CANCELLED',
    data: {
      ...payload,
      occurredAt: new Date().toISOString(),
    },
    metadata: {
      correlationId: randomUUID(),
      source: 'rider-service',
      version: 1,
    },
  };
  await publishEvent(Topics.RIDE_CANCELLED, event);
};
