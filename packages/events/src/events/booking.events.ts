export interface BookingConfirmedEvent {
  event: 'BOOKING_CONFIRMED'
  data: {
    rideId:        string
    riderId:       string
    driverId:      string
    tripId:        string
    estimatedFare: number
    distanceKm:    number
    durationMins:  number
    vehicleType:   string
    pickupAddress: string
    dropoffAddress: string
    occurredAt:    string
  }
  metadata: {
    correlationId: string
    source:        string
    version:       number
  }
}

export interface BookingFailedEvent {
  event: 'BOOKING_FAILED'
  data: {
    rideId:  string
    riderId: string
    reason:  string
    occurredAt: string
  }
  metadata: {
    correlationId: string
    source:        string
    version:       number
  }
}