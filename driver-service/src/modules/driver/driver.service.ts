import { logger } from "../../config/logger";
import { db } from "../../db";
import { driver } from "../../db/schema";
import { eq } from "drizzle-orm";
import { DriverProfile, InitialDriverData } from "../../types";

export class DriverService {
  async createDriver(driverData: InitialDriverData) {
    const { email, userId } = driverData;

    const existing = await db
      .select({ id: driver.id })
      .from(driver)
      .where(eq(driver.user_id, userId));

    if (existing.length > 0) {
      logger.info({ userId }, "driver already exists, skipping");
      return;
    }

    await db.insert(driver).values({
      user_id: userId,
      name: email.split("@")[0],
      email,
    });

    logger.info({ userId }, "driver created");
  }
  async updateDriverProfile(DriverData: DriverProfile) {
    try {
      const {
        name,
        licenseNumber,
        licenseExpiry,
        vehicleModel,
        vehiclePlate,
        userId,
        email,
        phone,
        vehicleType,
      } = DriverData;

      const existingUser = await db
        .select()
        .from(driver)
        .where(eq(driver.user_id, userId));
      if (existingUser.length === 0) {
        logger.info({ existingUser }, "driver not found");
        return;
      }
      await db
        .update(driver)
        .set({
          licenseNumber: licenseNumber,
          licenseExpiry: licenseExpiry,
          vehicleModel: vehicleModel,
          vehiclePlate: vehiclePlate,
          name: name,
          email: email,
          phone: phone,
          vehicleType: vehicleType,
        })
        .where(eq(driver.user_id, userId));
      const updatedUser = await db
        .select()
        .from(driver)
        .where(eq(driver.user_id, userId));
      logger.info({ userId }, "driver profile updated");
      return updatedUser;
    } catch (error) {
      logger.error({ error }, "driver profile update faild");
      throw new Error("Failed to Driver profile update");
    }
  }
}
