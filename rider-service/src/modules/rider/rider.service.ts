import { db } from '../../db';
import { rating, rideHistory, rider } from '../../db/schema';
import { eq, count, avg } from 'drizzle-orm';
import { logger } from '../../config/logger';
import {
  CreateRatingInput,
  CreateRideHistoryInput,
  InitialRiderData,
  RiderProfile,
} from '../../types';
import { publishDriverRated } from '../../events/producer/rating-added.producer';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export class RiderService {
  async createRider(data: InitialRiderData) {
    try {
      const { email, userId } = data;

      const existingRider = await db.select().from(rider).where(eq(rider.user_id, userId));
      if (existingRider.length > 0) {
        logger.info({ existingRider }, 'rider already exitsing ');
        return;
      }

      await db.insert(rider).values({
        email,
        user_id: userId,
        name: '',
        phone: '',
        status: 'PENDING',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      logger.info({ email }, 'rider created');
    } catch (error) {
      logger.error({ error }, 'rider creation faild');
      throw new Error('Failed to rider creation');
    }
  }
  async updateRiderProfile(data: RiderProfile) {
    try {
      const { name, phone, userId } = data;
      const existingRider = await db.select().from(rider).where(eq(rider.user_id, userId));
      if (existingRider.length === 0) {
        logger.info({ existingRider }, 'rider not found');
        return;
      }
      await db
        .update(rider)
        .set({
          name,
          phone,
          updatedAt: new Date(),
        })
        .where(eq(rider.user_id, userId));
      const updatedRider = await db.select().from(rider).where(eq(rider.user_id, userId));
      logger.info({ userId }, 'rider profile updated');
      return updatedRider;
    } catch (error) {
      logger.error({ error }, 'rider profile update faild');
      throw new Error('Failed to rider profile update');
    }
  }
  async getProfile(userId: string) {
    const getData = await db.select().from(rider).where(eq(rider.user_id, userId));
    if (getData.length === 0) {
      logger.info({ getData }, 'rider not found');
      throw new Error('Rider not found');
    }
    return getData;
  }

  async getHistory(riderId: string, page: number, limit: number) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(limit, MAX_LIMIT) || DEFAULT_LIMIT;
    const offset = (safePage - 1) * safeLimit;

    const records = await db
      .select()
      .from(rideHistory)
      .where(eq(rideHistory.riderId, riderId))
      .limit(safeLimit)
      .offset(offset);
    const [{ total }] = await db
      .select({ total: count() })
      .from(rideHistory)
      .where(eq(rideHistory.riderId, riderId));

    return {
      data: records,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
        hasNext: safePage * safeLimit < total,
        hasPrev: safePage > 1,
      },
    };
  }

  async getTripDetail(riderId: string, tripId: string) {
    const record = await db.select().from(rideHistory).where(eq(rideHistory.tripId, tripId));

    if (record.length === 0) throw new Error('Trip not found');

    if (record[0].riderId !== riderId) throw new Error('Forbidden');

    return record;
  }

  //! Called  by Kafka consumer
  async recordTrip(input: CreateRideHistoryInput) {
    const {
      riderId,
      tripId,
      driverId,
      pickupAddress,
      dropoffAddress,
      fare,
      distanceKm,
      durationMins,
      status,
      vehicleType,
      startedAt,
      completedAt,
    } = input;

    const existingTrip = await db.select().from(rideHistory).where(eq(rideHistory.tripId, tripId));
    if (existingTrip.length > 0) {
      logger.info({ existingTrip }, 'trip already exists');
      throw new Error('Trip already exists');
    }
    await db.insert(rideHistory).values({
      riderId,
      tripId,
      driverId,
      pickupAddress,
      dropoffAddress,
      fare,
      distanceKm,
      durationMins,
      status,
      vehicleType,
      startedAt,
      completedAt,
      createdAt: new Date(),
    });
    logger.info({ tripId }, 'trip recorded successfully');
  }

  async rateDriver(input: CreateRatingInput) {
    try {
      const { riderId, driverId, tripId, score, comment } = input;

      if (score < 1 || score > 5) {
        throw new Error('Score must be between 1 and 5');
      }

      const existingRating = await db.select().from(rating).where(eq(rating.tripId, tripId));
      if (existingRating.length > 0) {
        logger.info({ existingRating }, 'rating already exists');
        throw new Error('Rating already exists');
      }

      if (existingRating[0].riderId !== riderId) {
        throw new Error('Forbidden');
      }
      const newRating = await db.insert(rating).values({
        riderId,
        driverId,
        tripId,
        score,
        comment,
        createdAt: new Date(),
      });

      // publish event to driver-service updates driver's average rating
      await publishDriverRated({
        driverId,
        riderId,
        tripId,
        score,
      });

      logger.info({ tripId }, 'rating recorded successfully');
      return newRating;
    } catch (error) {
      logger.error({ error }, 'Failed to get rider rating');
      throw error;
    }
  }

  async getMyRating(riderId: string) {
    try {
      const result = await db
        .select({ avgScore: avg(rating.score), total: count() })
        .from(rating)
        .where(eq(rating.riderId, riderId));
      return {
        avgScore: result[0]?.avgScore ? Number(result[0].avgScore).toFixed(1) : null,
        total: Number(result[0]?.total) || 0,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get rider rating');
      throw error;
    }
  }
}
