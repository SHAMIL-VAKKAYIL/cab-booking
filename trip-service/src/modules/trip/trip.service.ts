import { eq } from "drizzle-orm";
import { db } from "../../db";
import { trips } from "../../db/schema";
import { redis } from "../../lib/redis";
import { logger } from "../../config/logger";
import {
  CreateTripInput,
  CompleteTripInput,
  CancelTripInput,
} from "../../types";
import {
  publishTripCreateReply,
  publishTripStarted,
  publishTripCompleted,
  publishTripCancelled,
} from "../../events/producer/trip.producer";
import { io } from "../../server";

const LOCATION_UPDATE_SEC = 30;

export class TripService {

  async createTrip(input: CreateTripInput) {
    const {
      correlationId,
      riderId,
      riderEmail,
      driverId,
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      vehicleType,
      estimatedFare,
    } = input;

    //! idempotency — rider can't have two active trips
    const existing = await db
      .select()
      .from(trips)
      .where(eq(trips.riderId, riderId));

    const activeTrip = existing.find((t) =>
      ["REQUESTED", "MATCHED", "IN_PROGRESS"].includes(t.status),
    );

    if (activeTrip) {
      logger.warn({ riderId }, "Rider already has an active trip");
      await publishTripCreateReply({
        correlationId,
        tripId: activeTrip.id,
        success: true,
      });
      return activeTrip;
    }

    const [trip] = await db
      .insert(trips)
      .values({
        riderId,
        riderEmail,
        driverId,
        status: "MATCHED",
        pickupAddress,
        pickupLat: pickupLat.toString(),
        pickupLng: pickupLng.toString(),
        dropoffAddress,
        dropoffLat: dropoffLat.toString(),
        dropoffLng: dropoffLng.toString(),
        vehicleType,
        estimatedFare: estimatedFare.toString(),
        updatedAt: new Date(),
      })
      .returning();

    await publishTripCreateReply({
      correlationId,
      tripId: trip.id,
      success: true,
    });

    logger.info({ tripId: trip.id, riderId }, "Trip created successfully");
    return trip;
  }

  async cancelTrip(input: CancelTripInput) {
    const { tripId, reason, cancelledBy } = input;
    const trip = await this.findById(tripId);

    if (!trip) {
      logger.warn({ tripId }, "Trip not found for cancellation, skipping");
      return;
    }

    if (["COMPLETED", "CANCELLED"].includes(trip.status)) {
      logger.warn(
        { tripId, status: trip.status },
        "Trip already in terminal state, skipping",
      );
      return;
    }

    const [updated] = await db
      .update(trips)
      .set({
        status: "CANCELLED",
        cancelReason: reason,
        cancelledBy,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId))
      .returning();

    await redis.del(`trip:location:${tripId}`);

    await publishTripCancelled({
      tripId: updated.id,
      riderId: updated.riderId,
      riderEmail: updated.riderEmail,
      driverId: updated.driverId ?? undefined,
      reason,
      cancelledBy,
      cancelledAt: updated.cancelledAt!.toISOString(),
    });

    logger.info({ tripId }, "Trip cancelled");
    return updated;
  }

  async startTrip(tripId: string, driverId: string) {
    const trip = await this.findById(tripId);

    if (!trip) throw new Error("Trip not found");
    if (trip.driverId !== driverId) throw new Error("Forbidden");
    if (trip.status !== "MATCHED") {
      throw new Error(`Cannot start trip with status ${trip.status}`);
    }

    const [updated] = await db
      .update(trips)
      .set({
        status: "IN_PROGRESS",
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId))
      .returning();

    await publishTripStarted({
      tripId: updated.id,
      riderId: updated.riderId,
      riderEmail: updated.riderEmail,
      driverId: updated.driverId!,
      startedAt: updated.startedAt!.toISOString(),
    });

    logger.info({ tripId }, "Trip started");
    return updated;
  }

  async completeTrip(input: CompleteTripInput) {
    const { tripId, driverId, distanceKm, durationMins } = input;
    const trip = await this.findById(tripId);

    if (!trip) throw new Error("Trip not found");
    if (trip.driverId !== driverId) throw new Error("Forbidden");
    if (trip.status !== "IN_PROGRESS") {
      throw new Error(`Cannot complete trip with status ${trip.status}`);
    }

    //! use estimated fare as final fare for now
    //! pricing-service will refine this later
    const finalFare = trip.estimatedFare;

    const [updated] = await db
      .update(trips)
      .set({
        status: "COMPLETED",
        finalFare,
        distanceKm: distanceKm.toString(),
        durationMins,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId))
      .returning();

    // clean up live location — trip is over
    await redis.del(`trip:location:${tripId}`);

    await publishTripCompleted({
      tripId: updated.id,
      riderId: updated.riderId,
      riderEmail: updated.riderEmail,
      driverId: updated.driverId!,
      fare: Number(finalFare),
      distanceKm,
      durationMins,
      pickupAddress: updated.pickupAddress,
      dropoffAddress: updated.dropoffAddress,
      vehicleType: updated.vehicleType,
      startedAt: updated.startedAt!.toISOString(),
      completedAt: updated.completedAt!.toISOString(),
    });

    logger.info({ tripId }, "Trip completed");
    return updated;
  }
  async updateLocation(tripId: string, lat: number, lng: number) {
    const trip = await this.findById(tripId);

    if (!trip) throw new Error("Trip not found");
    if (trip.status !== "IN_PROGRESS") {
      throw new Error("Can only update location for in-progress trips");
    }

    await redis.setEx(
      `trip:location:${tripId}`,
      LOCATION_UPDATE_SEC,
      JSON.stringify({ lat, lng, updatedAt: new Date().toISOString() }),
    );

    io.to(tripId).emit("location_updated", {
      tripId,
      lat,
      lng,
      updatedAt: new Date().toISOString(),
    });
  }

  async getLocation(tripId: string) {
    const data = await redis.get(`trip:location:${tripId}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  async getActiveByRiderId(riderId: string) {
    const result = await db
      .select()
      .from(trips)
      .where(eq(trips.riderId, riderId));

    return (
      result.find((t) =>
        ["REQUESTED", "MATCHED", "IN_PROGRESS"].includes(t.status),
      ) ?? null
    );
  }
  async findById(tripId: string) {
    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    return trip ?? null;
  }

  async getTripDetail(tripId: string) {
    const trip = await this.findById(tripId);
    if (!trip) throw new Error("Trip not found");
    return trip;
  }
}
