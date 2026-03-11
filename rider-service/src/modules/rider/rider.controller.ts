import { Request, Response, NextFunction } from 'express';
import { RiderService } from './rider.service';
import { logger } from '../../config/logger';

const riderService = new RiderService();

export const profileCreation = async (req: Request, res: Response) => {
  const userId = req.headers['user-id'] as string;
  const { name, phone } = req.body;
  try {
    const riderData = await riderService.updateRiderProfile({ name, phone, userId });
    return res.status(200).json({ message: 'Rider profile created successfully', riderData });
  } catch (error) {
    logger.error({ error }, 'Error in rider profile creation');
    return res.status(500).json({ message: 'Failed to create rider profile', error });
  }
};

export const getRiderProfile = async (req: Request, res: Response) => {
  const userId = req.headers['user-id'] as string;

  try {
    const rider = await riderService.getProfile(userId);
    return res.status(200).json({ message: 'rider profile fetch successfully', rider });
  } catch (error) {
    logger.error({ error }, 'Error in rider profile get');
    return res.status(500).json({ message: 'Failed to Get rider profile', error });
  }
};

export const rideHistoryController = {
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const riderId = req.headers['user-id'] as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await riderService.getHistory(riderId, page, limit);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getTripDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const riderId = req.headers['user-id'] as string;
      const { tripId } = req.params as { tripId: string };

      const record = await riderService.getTripDetail(riderId, tripId);
      res.status(200).json({ data: record });
    } catch (err) {
      next(err);
    }
  },
};

export const rateDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const riderId = req.headers['user-id'] as string;
    const { driverId, tripId, score, comment } = req.body;

    const result = await riderService.rateDriver({
      riderId,
      driverId,
      tripId,
      score,
      comment,
    });

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const getMyRating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const riderId = req.headers['user-id'] as string;
    const result = await riderService.getMyRating(riderId);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};
