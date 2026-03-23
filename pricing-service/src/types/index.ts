export interface CalculateFareInput {
    correlationId: string
    rideId: string
    pickupLat: number
    pickupLng: number
    dropoffLat: number
    dropoffLng: number
    vehicleType: 'ECONOMY' | 'PREMIUM'
}

export interface FareResult {
    fare: number
    distanceKm: number
    durationMins: number
}