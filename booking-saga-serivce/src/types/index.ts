export type SagaStatus =
  | 'STARTED'
  | 'FARE_CALCULATED'
  | 'DRIVER_FOUND'
  | 'TRIP_CREATED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'COMPENSATING'

export type VehicleType = 'ECONOMY' | 'PREMIUM'

export interface CreateSagaInput {
  rideId:         string
  riderId:        string
  pickupAddress:  string
  pickupLat:      number
  pickupLng:      number
  dropoffAddress: string
  dropoffLat:     number
  dropoffLng:     number
  vehicleType:    VehicleType
}

export interface UpdateSagaFareInput {
  rideId:        string
  estimatedFare: number
  distanceKm:    number
  durationMins:  number
}

export interface UpdateSagaDriverInput {
  rideId:   string
  driverId: string
}

export interface UpdateSagaTripInput {
  rideId: string
  tripId: string
}

export interface FailSagaInput {
  rideId:  string
  reason:  string
}