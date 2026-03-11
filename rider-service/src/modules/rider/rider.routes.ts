import { Router } from 'express';
import {
  cancelRide,
  deleteSavedPlace,
  getMyRating,
  getRiderProfile,
  getSavedPlaces,
  profileCreation,
  rateDriver,
  requestRide,
  rideHistoryController,
  savePlace,
} from './rider.controller';

const riderRouter: Router = Router();

riderRouter.post('/v1/update-profile', profileCreation);
riderRouter.get('/v1/get-profile', getRiderProfile);

riderRouter.get('/v1/history', rideHistoryController.getHistory);
riderRouter.get('/v1/history/:tripId', rideHistoryController.getTripDetail);

riderRouter.post('/v1/ratings', rateDriver);
riderRouter.get('/v1/ratings/me', getMyRating);

riderRouter.post('/v1/saved-places', savePlace);
riderRouter.get('/v1/saved-places', getSavedPlaces);
riderRouter.delete('/v1/saved-places/:placeId', deleteSavedPlace);

riderRouter.post('/v1/rides/request', requestRide)
riderRouter.delete('/v1/rides/:rideId/cancel', cancelRide)
export { riderRouter };
