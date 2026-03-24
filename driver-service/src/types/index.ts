export interface CreateDriverInput {
  userId: string
  email:  string
}

export interface UpdateDriverProfileInput {
  userId:        string
  name:          string
  phone:         string
  licenseNumber: string
  licenseExpiry: Date
}

export interface UpdateVehicleInput {
  userId:       string
  vehicleModel: string
  vehiclePlate: string
  vehicleType:  'ECONOMY' | 'PREMIUM'
}

export interface ToggleAvailabilityInput {
  userId: string
  lat:    number
  lng:    number
}

export interface UpdateRatingInput {
  driverId: string
  score:    number
}