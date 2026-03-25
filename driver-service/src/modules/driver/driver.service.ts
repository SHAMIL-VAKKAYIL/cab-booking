import { eq } from "drizzle-orm";
import { db } from "../../db";
import { driver } from "../../db/schema";
import { redis, DRIVER_LOCATION_KEY } from "../../lib/redis";
import { logger } from "../../config/logger";
import {
  CreateDriverInput,
  UpdateDriverProfileInput,
  UpdateVehicleInput,
  ToggleAvailabilityInput,
  UpdateRatingInput,
} from "../../types";
import {
  publishDriverOnline,
  publishDriverOffline,
} from "../../events/producer/driver.producer";

export class DriverService {
  async createDriver(data: CreateDriverInput) {
    const { userId, email } = data;

    const existing = await db
      .select()
      .from(driver)
      .where(eq(driver.user_id, userId));

    if (existing.length > 0) {
      logger.info({ userId }, "Driver already exists, skipping");
      return;
    }

    await db.insert(driver).values({
      user_id: userId,
      email,
      status: "APPROVED",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logger.info({ userId, email }, "Driver created");
  }

  async updateProfile(data: UpdateDriverProfileInput) {
    const { userId, name, phone, licenseNumber, licenseExpiry } = data;

    const existing = await db
      .select()
      .from(driver)
      .where(eq(driver.user_id, userId));

    if (existing.length === 0) throw new Error("Driver not found");

    const [updated] = await db
      .update(driver)
      .set({ name, phone, licenseNumber, licenseExpiry, updatedAt: new Date() })
      .where(eq(driver.user_id, userId))
      .returning();

    logger.info({ userId }, "Driver profile updated");
    return updated;
  }

  async updateVehicle(data: UpdateVehicleInput) {
    const { userId, vehicleModel, vehiclePlate, vehicleType } = data;

    const existing = await db
      .select()
      .from(driver)
      .where(eq(driver.user_id, userId));

    if (existing.length === 0) throw new Error("Driver not found");

    const [updated] = await db
      .update(driver)
      .set({ vehicleModel, vehiclePlate, vehicleType, updatedAt: new Date() })
      .where(eq(driver.user_id, userId))
      .returning();

    logger.info({ userId }, "Vehicle info updated");
    return updated;
  }

  async toggleAvailability(data: ToggleAvailabilityInput) {
    const { userId, lat, lng } = data;

    const existing = await db
      .select()
      .from(driver)
      .where(eq(driver.user_id, userId));
    if (existing.length === 0) throw new Error("Driver not found");

    const currentDriver = existing[0];

    if (currentDriver.status !== "APPROVED") {
      throw new Error("Driver account is not approved");
    }

    if (currentDriver.availability === "ON_TRIP") {
      throw new Error("Cannot toggle availability while on a trip");
    }

    const goingOnline = currentDriver.availability === "OFFLINE";
    const newAvailability = goingOnline ? "ONLINE" : "OFFLINE";

    const [updated] = await db
      .update(driver)
      .set({ availability: newAvailability, updatedAt: new Date() })
      .where(eq(driver.user_id, userId))
      .returning();

    if (goingOnline) {
      // store location in Redis when going online
      await redis.geoAdd(DRIVER_LOCATION_KEY, {
        longitude: lng,
        latitude: lat,
        member: currentDriver.id,
      });

      await publishDriverOnline({
        driverId: currentDriver.id,
        vehicleType: currentDriver.vehicleType ?? "ECONOMY",
        lat,
        lng,
      });

      logger.info({ userId, driverId: currentDriver.id }, "Driver online");
    } else {
      // remove from Redis when going offline
      await redis.zRem(DRIVER_LOCATION_KEY, currentDriver.id);

      await publishDriverOffline({
        driverId: currentDriver.id,
      });

      logger.info({ userId, driverId: currentDriver.id }, "Driver offline");
    }

    return updated;
  }

  async getProfile(userId: string) {
    const result = await db
      .select()
      .from(driver)
      .where(eq(driver.user_id, userId));

    if (result.length === 0) throw new Error("Driver not found");
    return result[0];
  }

  async getRating(userId: string) {
    const result = await db
      .select({
        averageRating: driver.averageRating,
        totalRatings: driver.totalRatings,
      })
      .from(driver)
      .where(eq(driver.user_id, userId));

    if (result.length === 0) throw new Error("Driver not found");
    return result[0];
  }

  // called by Kafka consumer (driver.rated)
  async updateRating(data: UpdateRatingInput) {
    const { driverId, score } = data;

    const existing = await db
      .select()
      .from(driver)
      .where(eq(driver.id, driverId));

    if (existing.length === 0) {
      logger.warn({ driverId }, "Driver not found for rating update, skipping");
      return;
    }

    const currentDriver = existing[0];
    const totalRatings = currentDriver.totalRatings + 1;
    const averageRating = (
      (Number(currentDriver.averageRating) * currentDriver.totalRatings +
        score) /
      totalRatings
    ).toFixed(2);

    await db
      .update(driver)
      .set({
        averageRating: averageRating.toString(),
        totalRatings,
        updatedAt: new Date(),
      })
      .where(eq(driver.id, driverId));

    logger.info(
      { driverId, averageRating, totalRatings },
      "Driver rating updated",
    );
  }
}
