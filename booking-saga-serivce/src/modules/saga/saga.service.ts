import { eq } from "drizzle-orm";
import { db } from "../../db";
import { bookingSagas } from "../../db/schema";
import { logger } from "../../config/logger";
import {
  CreateSagaInput,
  UpdateSagaFareInput,
  UpdateSagaDriverInput,
  UpdateSagaTripInput,
  FailSagaInput,
} from "../../types";
import {
  publishFareCalculateCommand,
  publishDriverFindCommand,
  publishTripCreateCommand,
  publishDriverReleaseCommand,
  publishBookingConfirmed,
  publishBookingFailed,
} from "../../events/producer/saga.producer";

export class SagaService {
  //!  ride.requested consumed
  async startSaga(input: CreateSagaInput) {
    const {
      rideId,
      riderId,
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      vehicleType,
    } = input;

    // idempotency — don't create duplicate sagas
    const existing = await db
      .select()
      .from(bookingSagas)
      .where(eq(bookingSagas.rideId, rideId));

    if (existing.length > 0) {
      logger.warn({ rideId }, "Saga already exists, skipping");
      return existing[0];
    }

    const [saga] = await db
      .insert(bookingSagas)
      .values({
        rideId,
        riderId,
        status: "STARTED",
        vehicleType,
        pickupAddress,
        pickupLat: pickupLat.toString(),
        pickupLng: pickupLng.toString(),
        dropoffAddress,
        dropoffLat: dropoffLat.toString(),
        dropoffLng: dropoffLng.toString(),
        updatedAt: new Date(),
      })
      .returning();

    logger.info({ rideId, riderId }, "Saga started");

    // calculate fare
    await publishFareCalculateCommand({
      correlationId: rideId,
      rideId,
      riderId,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      vehicleType,
    });

    return saga;
  }

  //! fare.calculate.reply consume
  async handleFareCalculated(input: UpdateSagaFareInput) {
    const { rideId, estimatedFare, distanceKm, durationMins } = input;

    const saga = await this.findByRideId(rideId);
    if (!saga) {
      logger.warn({ rideId }, "Saga not found for fare reply, skipping");
      return;
    }

    if (saga.status !== "STARTED") {
      logger.warn(
        { rideId, status: saga.status },
        "Saga not in STARTED state, skipping",
      );
      return;
    }

    const [updated] = await db
      .update(bookingSagas)
      .set({
        status: "FARE_CALCULATED",
        estimatedFare: estimatedFare.toString(),
        distanceKm: distanceKm.toString(),
        durationMins,
        updatedAt: new Date(),
      })
      .where(eq(bookingSagas.rideId, rideId))
      .returning();

    logger.info({ rideId, estimatedFare }, "Fare calculated, finding driver");

    // Step 2 action — find driver
    await publishDriverFindCommand({
      correlationId: rideId,
      rideId,
      riderId: saga.riderId,
      pickupLat: Number(saga.pickupLat),
      pickupLng: Number(saga.pickupLng),
      vehicleType: saga.vehicleType,
    });

    return updated;
  }

  // ─── Step 3: driver.find.reply consumed ──────────────────────────
  async handleDriverFound(input: UpdateSagaDriverInput) {
    const { rideId, driverId } = input;

    const saga = await this.findByRideId(rideId);
    if (!saga) {
      logger.warn({ rideId }, "Saga not found for driver reply, skipping");
      return;
    }

    if (saga.status !== "FARE_CALCULATED") {
      logger.warn(
        { rideId, status: saga.status },
        "Saga not in FARE_CALCULATED state, skipping",
      );
      return;
    }

    const [updated] = await db
      .update(bookingSagas)
      .set({
        status: "DRIVER_FOUND",
        driverId,
        updatedAt: new Date(),
      })
      .where(eq(bookingSagas.rideId, rideId))
      .returning();

    logger.info({ rideId, driverId }, "Driver found, creating trip");

    //! create trip
    await publishTripCreateCommand({
      correlationId: rideId,
      rideId,
      riderId: saga.riderId,
      driverId,
      pickupAddress: saga.pickupAddress,
      pickupLat: Number(saga.pickupLat),
      pickupLng: Number(saga.pickupLng),
      dropoffAddress: saga.dropoffAddress,
      dropoffLat: Number(saga.dropoffLat),
      dropoffLng: Number(saga.dropoffLng),
      vehicleType: saga.vehicleType,
      estimatedFare: Number(saga.estimatedFare),
    });

    return updated;
  }

  //! trip create reply consume
  async handleTripCreated(input: UpdateSagaTripInput) {
    const { rideId, tripId } = input;

    const saga = await this.findByRideId(rideId);
    if (!saga) {
      logger.warn({ rideId }, "Saga not found for trip reply, skipping");
      return;
    }

    if (saga.status !== "DRIVER_FOUND") {
      logger.warn(
        { rideId, status: saga.status },
        "Saga not in DRIVER_FOUND state, skipping",
      );
      return;
    }

    const [updated] = await db
      .update(bookingSagas)
      .set({
        status: "CONFIRMED",
        tripId,
        updatedAt: new Date(),
      })
      .where(eq(bookingSagas.rideId, rideId))
      .returning();

    logger.info({ rideId, tripId }, "Trip created, booking confirmed");

    //! publish booking confirmed
    await publishBookingConfirmed({
      correlationId: rideId,
      rideId,
      riderId: saga.riderId,
      driverId: saga.driverId!,
      tripId,
      estimatedFare: Number(saga.estimatedFare),
      distanceKm: Number(saga.distanceKm),
      durationMins: saga.durationMins!,
      vehicleType: saga.vehicleType,
      pickupAddress: saga.pickupAddress,
      dropoffAddress: saga.dropoffAddress,
    });

    return updated;
  }

  //! Failure handler
  async failSaga(input: FailSagaInput) {
    const { rideId, reason } = input;

    const saga = await this.findByRideId(rideId);
    if (!saga) {
      logger.warn({ rideId }, "Saga not found for failure, skipping");
      return;
    }

    // already in terminal state
    if (["CONFIRMED", "FAILED"].includes(saga.status)) {
      logger.warn(
        { rideId, status: saga.status },
        "Saga already in terminal state, skipping",
      );
      return;
    }

    await db
      .update(bookingSagas)
      .set({
        status: "FAILED",
        failureReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(bookingSagas.rideId, rideId));

    // compensation — release driver if one was assigned
    if (saga.driverId) {
      await publishDriverReleaseCommand({
        correlationId: rideId,
        driverId: saga.driverId,
        vehicleType: saga.vehicleType,
      });
      logger.info(
        { rideId, driverId: saga.driverId },
        "Driver released as compensation",
      );
    }

    await publishBookingFailed({
      correlationId: rideId,
      rideId,
      riderId: saga.riderId,
      reason,
    });

    logger.info({ rideId, reason }, "Saga failed");
  }

  //! ride cancelled consume
  async handleRideCancelled(rideId: string) {
    const saga = await this.findByRideId(rideId);
    if (!saga) {
      logger.warn({ rideId }, "Saga not found for cancellation, skipping");
      return;
    }

    // if already confirmed, trip-service handles it
    if (saga.status === "CONFIRMED") {
      logger.info(
        { rideId },
        "Saga already confirmed, trip-service handles cancellation",
      );
      return;
    }

    await this.failSaga({ rideId, reason: "RIDER_CANCELLED" });
  }

  async findByRideId(rideId: string) {
    const [saga] = await db
      .select()
      .from(bookingSagas)
      .where(eq(bookingSagas.rideId, rideId));
    return saga ?? null;
  }
}
