export interface CreateTripInput {
    correlationId: string
    riderId: string
    riderEmail: string
    driverId: string
    pickupAddress: string
    pickupLat: number
    pickupLng: number
    dropoffAddress: string
    dropoffLat: number
    dropoffLng: number
    vehicleType: 'ECONOMY' | 'PREMIUM'
    estimatedFare: number
}

export interface CompleteTripInput {
    tripId: string
    driverId: string
    distanceKm: number
    durationMins: number
}

export interface CancelTripInput {
    tripId: string
    reason: string
    cancelledBy: 'RIDER' | 'DRIVER'
}