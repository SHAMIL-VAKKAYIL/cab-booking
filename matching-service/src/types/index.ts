export interface FindDriverInput {
  correlationId: string
  rideId:        string
  riderId:       string
  pickupLat:     number
  pickupLng:     number
  vehicleType:   'ECONOMY' | 'PREMIUM'
  radiusKm:      number
}

export interface DriverLocation {
  driverId:    string
  lat:         number
  lng:         number
  vehicleType: 'ECONOMY' | 'PREMIUM'
}