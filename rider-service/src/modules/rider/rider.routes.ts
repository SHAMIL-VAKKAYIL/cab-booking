import { Router } from 'express';
import {
  cancelRide,
  deleteSavedPlace,
  getHistory,
  getMyRating,
  getRiderProfile,
  getSavedPlaces,
  getTripDetail,
  profileCreation,
  rateDriver,
  requestRide,
  savePlace,
} from './rider.controller';

const riderRouter: Router = Router();

riderRouter.put('/v1/update-profile', profileCreation);
riderRouter.get('/v1/get-profile', getRiderProfile);

riderRouter.get('/v1/history', getHistory);
riderRouter.get('/v1/history/:tripId', getTripDetail);

riderRouter.post('/v1/ratings', rateDriver);
riderRouter.get('/v1/ratings/me', getMyRating);

riderRouter.post('/v1/saved-places', savePlace);
riderRouter.get('/v1/saved-places', getSavedPlaces);
riderRouter.delete('/v1/saved-places/:placeId', deleteSavedPlace);

riderRouter.post('/v1/rides/request', requestRide);
riderRouter.delete('/v1/rides/:rideId/cancel', cancelRide);
export { riderRouter };
