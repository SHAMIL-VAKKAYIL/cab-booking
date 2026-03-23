import { FARE_CONFIG } from '../../config/fare'
import { CalculateFareInput, FareResult } from '../../types'
import { logger } from '../../config/logger'

const calculateDistance = (
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return parseFloat((R * c).toFixed(2))
}

export class PricingService {

    calculateFare(input: CalculateFareInput): FareResult {
        const {
            pickupLat, pickupLng,
            dropoffLat, dropoffLng,
            vehicleType
        } = input

        const distanceKm = calculateDistance(
            pickupLat, pickupLng,
            dropoffLat, dropoffLng
        )

        // estimate duration from distance and average city speed
        const durationMins = parseFloat(
            ((distanceKm / FARE_CONFIG.avgSpeedKmh) * 60).toFixed(0)
        )

        const config = FARE_CONFIG[vehicleType]

        const fare = parseFloat((
            (
                config.baseFare +
                config.pricePerKm * distanceKm +
                config.pricePerMin * durationMins
            )
            * config.vehicleMultiplier
        ).toFixed(2))

        logger.info({ vehicleType, distanceKm, durationMins, fare }, 'Fare calculated')

        return { fare, distanceKm, durationMins }
    }
}