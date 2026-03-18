import { Request, Response, NextFunction } from 'express'
import { TripService } from './trip.service'

const tripService = new TripService()

export const startTrip = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driverId = req.headers['user-id'] as string
        const { tripId } = req.params as { tripId: string }

        const trip = await tripService.startTrip(tripId, driverId)
        res.status(200).json({ data: trip })
    } catch (err) {
        next(err)
    }
}

export const completeTrip = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driverId = req.headers['user-id'] as string
        const { tripId } = req.params as { tripId: string }
        const { distanceKm, durationMins } = req.body as { distanceKm: number, durationMins: number }

        const trip = await tripService.completeTrip({
            tripId,
            driverId,
            distanceKm,
            durationMins
        })
        res.status(200).json({ data: trip })
    } catch (err) {
        next(err)
    }
}

export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tripId } = req.params as { tripId: string }
        const { lat, lng } = req.body as { lat: number, lng: number }

        await tripService.updateLocation(tripId, lat, lng)
        res.status(200).json({ message: 'Location updated' })
    } catch (err) {
        next(err)
    }
}

export const getLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tripId } = req.params as { tripId: string }
        const location = await tripService.getLocation(tripId)

        if (!location) {
            return res.status(200).json({ data: null, message: 'Location not available' })
        }

        res.status(200).json({ data: location })
    } catch (err) {
        next(err)
    }
}

export const getTripDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tripId } = req.params as { tripId: string }
        const trip = await tripService.getTripDetail(tripId)
        res.status(200).json({ data: trip })
    } catch (err) {
        next(err)
    }
}

export const getActiveRide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const riderId = req.headers['user-id'] as string
        const trip = await tripService.getActiveByRiderId(riderId)

        if (!trip) return res.status(404).json({ data: null })
        res.status(200).json({ data: trip })
    } catch (err) {
        next(err)
    }
}