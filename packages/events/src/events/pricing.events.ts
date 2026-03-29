export interface FareCalculateCommandEvent {
  event: 'FARE_CALCULATE_COMMAND'
  data: {
    correlationId:  string
    rideId:         string
    pickupLat:      number
    pickupLng:      number
    dropoffLat:     number
    dropoffLng:     number
    vehicleType:    'ECONOMY' | 'PREMIUM'
    occurredAt:     string
  }
  metadata: {
    correlationId: string
    source:        string
    version:       number
  }
}

export interface FareCalculateReplyEvent {
  event: 'FARE_CALCULATE_REPLY'
  data: {
    correlationId: string
    rideId:        string
    success:       boolean
    fare?:         number
    distanceKm?:   number
    durationMins?: number
    reason?:       string
    occurredAt:    string
  }
  metadata: {
    correlationId: string
    source:        string
    version:       number
  }
}