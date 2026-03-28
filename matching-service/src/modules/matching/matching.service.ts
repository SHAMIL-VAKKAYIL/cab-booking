import {
  redis,
  DRIVER_LOCATIONS_KEY,
  DRIVER_AVAILABLE_KEY,
  DRIVER_VEHICLE_KEY,
} from "../../lib/redis";
import { logger } from "../../config/logger";
import { FindDriverInput, DriverLocation } from "../../types";

const DEFAULT_RADIUS_KM = 5;
const MAX_RADIUS_KM = 20;
const SEARCH_COUNT = 20; // fetch top 20 nearest, then filter

export class MatchingService {

  async findNearestDriver(input: FindDriverInput): Promise<string | null> {
    const {
      pickupLat,
      pickupLng,
      vehicleType,
      radiusKm = DEFAULT_RADIUS_KM
    } = input

    //! get nearest drivers within radius from Redis GeoSet

    const nearbyDrivers = await redis.geoSearch(
      DRIVER_LOCATIONS_KEY,
      { latitude: pickupLat, longitude: pickupLng },
      { radius: radiusKm, unit: 'km' },
      { SORT: 'ASC', COUNT: SEARCH_COUNT }
    )

    if (!nearbyDrivers || nearbyDrivers.length === 0) {
      logger.warn({ pickupLat, pickupLng, radiusKm }, 'No drivers found in radius')

      // expand radius and try again up to MAX_RADIUS_KM
      if (radiusKm < MAX_RADIUS_KM) {
        logger.info({ radiusKm }, 'Expanding search radius')
        return this.findNearestDriver({
          ...input,
          radiusKm: radiusKm + 2
        })
      }

      return null
    }

    const [availableDrivers, vehicleDrivers] = await Promise.all([
      redis.sMembers(DRIVER_AVAILABLE_KEY),
      redis.sMembers(DRIVER_VEHICLE_KEY(vehicleType))
    ])

    const availableSet = new Set(availableDrivers)
    const vehicleSet   = new Set(vehicleDrivers)

    //! find first driver that is both available and has correct vehicle type
    

    const matchedDriverId = nearbyDrivers.find(
      driverId => availableSet.has(driverId) && vehicleSet.has(driverId)
    )

    if (!matchedDriverId) {
      logger.warn({ vehicleType, nearbyCount: nearbyDrivers.length }, 'No available drivers with matching vehicle type')
      return null
    }

    logger.info({ matchedDriverId, vehicleType }, 'Driver found')
    return matchedDriverId
  }

  async markDriverBusy(driverId: string, vehicleType: string) {
    //! remove from available — keep in locations so trip tracking still works
    await Promise.all([
      redis.sRem(DRIVER_AVAILABLE_KEY, driverId),
      redis.sRem(DRIVER_VEHICLE_KEY(vehicleType), driverId),
    ])
    logger.info({ driverId }, 'Driver marked as busy')
  }

  async releaseDriver(driverId: string, vehicleType: string) {
    //! add back to available
    await Promise.all([
      redis.sAdd(DRIVER_AVAILABLE_KEY, driverId),
      redis.sAdd(DRIVER_VEHICLE_KEY(vehicleType), driverId),
    ])
    logger.info({ driverId }, 'Driver released back to available')
  }

  async addDriverToPool(data: DriverLocation) {
    const { driverId, lat, lng, vehicleType } = data

    await Promise.all([
      redis.geoAdd(DRIVER_LOCATIONS_KEY, {
        longitude: lng,
        latitude:  lat,
        member:    driverId
      }),
      redis.sAdd(DRIVER_AVAILABLE_KEY, driverId),
      redis.sAdd(DRIVER_VEHICLE_KEY(vehicleType), driverId),
    ])

    logger.info({ driverId, vehicleType }, 'Driver added to pool')
  }

  async removeDriverFromPool(driverId: string, vehicleType: string) {
    await Promise.all([
      redis.zRem(DRIVER_LOCATIONS_KEY, driverId),
      redis.sRem(DRIVER_AVAILABLE_KEY, driverId),
      redis.sRem(DRIVER_VEHICLE_KEY(vehicleType), driverId),
    ])

    logger.info({ driverId }, 'Driver removed from pool')
  }
}