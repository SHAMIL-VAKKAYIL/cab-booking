import { Router } from 'express';
import {
  deleteSavedPlace,
  getMyRating,
  getRiderProfile,
  getSavedPlaces,
  profileCreation,
  rateDriver,
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

export { riderRouter };
