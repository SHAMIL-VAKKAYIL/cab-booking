import { Router } from 'express'
import {
    startTrip,
    completeTrip,
    updateLocation,
    getLocation,
    getTripDetail,
    getActiveRide,
} from './trip.controller'

const tripRouter: Router = Router()

tripRouter.get('/v1/trips/:tripId', getTripDetail)
tripRouter.post('/v1/trips/:tripId/start', startTrip)
tripRouter.post('/v1/trips/:tripId/complete', completeTrip)
tripRouter.post('/v1/trips/:tripId/location', updateLocation)
tripRouter.get('/v1/trips/:tripId/location', getLocation)
tripRouter.get('/v1/trips/active', getActiveRide)

export { tripRouter }