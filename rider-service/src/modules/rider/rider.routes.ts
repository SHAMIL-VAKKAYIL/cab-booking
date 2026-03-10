import { Router } from "express";
import { getMyRating, getRiderProfile, profileCreation, rateDriver, rideHistoryController } from "./rider.controller";

const riderRouter: Router = Router()

riderRouter.post('/v1/update-profile', profileCreation);
riderRouter.get('/v1/get-profile', getRiderProfile)
riderRouter.get('/v1/history', rideHistoryController.getHistory)
riderRouter.get('/v1/history/:tripId', rideHistoryController.getTripDetail)
riderRouter.post('/v1/ratings', rateDriver)
riderRouter.get('/v1/ratings/me', getMyRating)

export { riderRouter }