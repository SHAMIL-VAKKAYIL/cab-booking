export interface DriverRatedEvent {
  event: "DRIVER_RATED";
  data: {
    driverId: string;
    riderId: string;
    tripId: string;
    score: number;
    occurredAt: string;
  };
  metadata: {
    correlationId: string;
    source: string;
    version: number;
  };
}
