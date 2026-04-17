import { db } from '../../db';
import { rating, rideHistory, rider, savedPlaces } from '../../db/schema';
import { eq, count, avg, and } from 'drizzle-orm';
import { logger } from '../../config/logger';
import {
  CancelRideInput,
  CreateRatingInput,
  CreateRideHistoryInput,
  CreateSavedPlaceInput,
  InitialRiderData,
  RequestRideInput,
  RiderProfile,
} from '../../types';
import { publishDriverRated } from '../../events/producer/rating-added.producer';
import { randomUUID } from 'crypto';
import {
  publishRideCancelled,
  publishRideRequested,
} from '../../events/producer/ride-request.producer';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export class RiderService {
  private async getRiderIdByUserId(userId: string): Promise<string> {
    const rows = await db.select({ id: rider.id }).from(rider).where(eq(rider.user_id, userId));
    if (rows.length === 0) throw new Error('Rider not found');
    return rows[0].id;
  }

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
      throw new Error('Failed to rider creation', { cause: error });
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
      throw new Error('Failed to rider profile update', { cause: error });
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

  async getHistory(userId: string, page: number, limit: number) {
    const riderId = await this.getRiderIdByUserId(userId);
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

  async getTripDetail(userId: string, tripId: string) {
    const riderId = await this.getRiderIdByUserId(userId);
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
      const { riderId: userId, driverId, tripId, score, comment } = input;
      const riderId = await this.getRiderIdByUserId(userId);

      if (score < 1 || score > 5) {
        throw new Error('Score must be between 1 and 5');
      }

      const trip = await db.select().from(rideHistory).where(eq(rideHistory.tripId, tripId));

      if (trip.length === 0) {
        throw new Error('Trip not found');
      }

      if (trip[0].riderId !== riderId) {
        throw new Error('Forbidden');
      }

      if (trip[0].status !== 'COMPLETED') {
        throw new Error('Can only rate completed trips');
      }

      const existingRating = await db.select().from(rating).where(eq(rating.tripId, tripId));
      if (existingRating.length > 0) {
        logger.info({ existingRating }, 'rating already exists');
        throw new Error('Rating already exists');
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

  async getMyRating(userId: string) {
    try {
      const riderId = await this.getRiderIdByUserId(userId);
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

  async savePlace(data: CreateSavedPlaceInput) {
    try {
      const { riderId: userId, label, alias, address, latitude, longitude } = data;
      const riderId = await this.getRiderIdByUserId(userId);

      if (label === 'HOME' || label === 'WORK') {
        const existingPlace = await db
          .select()
          .from(savedPlaces)
          .where(and(eq(savedPlaces.riderId, riderId), eq(savedPlaces.label, label)));
        if (existingPlace.length > 0) {
          const [updated] = await db
            .update(savedPlaces)
            .set({
              alias,
              address,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            })
            .where(eq(savedPlaces.id, existingPlace[0].id))
            .returning();
          logger.info({ updated }, 'place updated successfully');
          return updated;
        }
      }
      const [place] = await db
        .insert(savedPlaces)
        .values({
          riderId,
          label,
          alias: alias ?? '',
          address,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          createdAt: new Date(),
        })
        .returning();
      logger.info({ place }, 'place saved successfully');
      return place;
    } catch (error) {
      logger.error({ error }, 'Failed to save place');
      throw error;
    }
  }

  async getSavePlaces(userId: string) {
    try {
      const riderId = await this.getRiderIdByUserId(userId);
      const places = await db.select().from(savedPlaces).where(eq(savedPlaces.riderId, riderId));
      return places;
    } catch (error) {
      logger.error({ error }, 'Failed to get saved places');
      throw error;
    }
  }
  async deleteSavedPlace(userId: string, placeId: string) {
    try {
      const riderId = await this.getRiderIdByUserId(userId);
      const existingPlace = await db.select().from(savedPlaces).where(eq(savedPlaces.id, placeId));
      if (existingPlace.length === 0) {
        logger.info({ existingPlace }, 'place not found');
        throw new Error('Place not found');
      }
      if (existingPlace[0].riderId !== riderId) {
        logger.info({ existingPlace }, 'Forbidden');
        throw new Error('Forbidden');
      }

      const [deleted] = await db.delete(savedPlaces).where(eq(savedPlaces.id, placeId)).returning();
      logger.info({ deleted }, 'place deleted successfully');
      return deleted;
    } catch (error) {
      logger.error({ error }, 'Failed to delete place');
      throw error;
    }
  }
  async requestRide(input: RequestRideInput) {
    try {
      const {
        riderId: userId,
        pickupLat,
        pickupLng,
        pickupAddress,
        dropoffLat,
        dropoffLng,
        dropoffAddress,
        vehicleType,
      } = input;
      const riderId = await this.getRiderIdByUserId(userId);

      const existingRider = await db.select().from(rider).where(eq(rider.id, riderId));
      if (existingRider.length === 0) {
        logger.info({ existingRider }, 'rider not found');
        throw new Error('Rider not found');
      }

      if (!existingRider[0].isActive) {
        logger.info({ existingRider }, 'rider not active');
        throw new Error('Rider not active');
      }

      if (existingRider[0].status !== 'APPROVED') {
        logger.info({ existingRider }, 'rider not approved');
        throw new Error('Rider not approved');
      }

      const rideId = randomUUID();

      await publishRideRequested({
        rideId,
        riderId,
        riderEmail: existingRider[0].email,
        pickupLat,
        pickupLng,
        pickupAddress,
        dropoffLat,
        dropoffLng,
        dropoffAddress,
        vehicleType: vehicleType ?? 'ECONOMY',
      });

      logger.info({ rideId }, 'ride requested successfully');
      return { rideId, status: 'Requested' };
    } catch (error) {
      logger.error({ err:error }, 'Failed to request ride');
      throw error;
    }
  }

  async cancelRide(input: CancelRideInput) {
    try {
      const { rideId, reason, riderId } = input;

      await publishRideCancelled({
        rideId,
        riderId,
        reason: reason ?? 'RIDER_CANCELLED',
      });
      logger.info({ rideId, riderId }, 'Ride cancelled successfully');
      return { rideId, status: 'CANCELLED' };
    } catch (error) {
      logger.error({ error }, 'Failed to cancel ride');
      throw error;
    }
  }
}
