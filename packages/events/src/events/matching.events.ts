export interface DriverFindCommandEvent {
  event: "DRIVER_FIND_COMMAND";
  data: {
    correlationId: string;
    rideId: string;
    riderId: string;
    pickupLat: number;
    pickupLng: number;
    vehicleType: "ECONOMY" | "PREMIUM";
    radiusKm?: number;
    occurredAt: string;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}

export interface DriverFindReplyEvent {
  event: "DRIVER_FIND_REPLY";
  data: {
    correlationId: string;
    rideId: string;
    success: boolean;
    driverId?: string;
    reason?: string;
    occurredAt: string;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}

export interface DriverReleaseCommandEvent {
  event: "DRIVER_RELEASE_COMMAND";
  data: {
    correlationId: string;
    driverId: string;
    vehicleType?: "ECONOMY" | "PREMIUM";
    occurredAt: string;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}
