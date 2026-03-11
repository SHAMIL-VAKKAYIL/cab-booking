export interface RideRequestedEvent {
  event: 'RIDE_REQUESTED'
  data: {
    rideId:        string
    riderId:       string
    pickupLat:     number
    pickupLng:     number
    pickupAddress: string
    dropoffLat:    number
    dropoffLng:    number
    dropoffAddress: string
    vehicleType:   string
    occurredAt:    string
  }
  metadata: {
    correlationId: string
    source:        string
    version:       number
  }
}

export interface RideCancelledEvent {
  event: 'RIDE_CANCELLED'
  data: {
    rideId:     string
    riderId:    string
    reason:     string
    occurredAt: string
  }
  metadata: {
    correlationId: string
    source:        string
    version:       number
  }
}