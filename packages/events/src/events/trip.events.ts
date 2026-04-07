export interface TripCreateCommandEvent {
  event: "TRIP_CREATE_COMMAND";
  data: {
    correlationId: string;
    riderId: string;
    riderEmail: string;
    driverId: string;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropoffAddress: string;
    dropoffLat: number;
    dropoffLng: number;
    vehicleType: 'ECONOMY' | 'PREMIUM';
    estimatedFare: number;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}

export interface TripCreateReplyEvent {
  event: "TRIP_CREATE_REPLY";
  data: {
    correlationId: string;
    tripId: string;
    success: boolean;
    reason?: string;
    occurredAt: string;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}

export interface TripStartedEvent {
  event: "TRIP_STARTED";
  data: {
    tripId: string;
    riderId: string;
    riderEmail: string;
    driverId: string;
    startedAt: string;
    occurredAt: string;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}

export interface TripCompletedEvent {
  event: "TRIP_COMPLETED";
  data: {
    tripId: string;
    riderId: string;
    riderEmail: string;
    driverId: string;
    fare: number;
    distanceKm: number;
    durationMins: number;
    pickupAddress: string;
    dropoffAddress: string;
    vehicleType: string;
    startedAt: string;
    completedAt: string;
    occurredAt: string;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}

export interface TripCancelledEvent {
  event: "TRIP_CANCELLED";
  data: {
    tripId: string;
    riderId: string;
    riderEmail: string;
    driverId?: string;
    reason: string;
    cancelledBy: string;
    cancelledAt: string;
    occurredAt: string;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}
