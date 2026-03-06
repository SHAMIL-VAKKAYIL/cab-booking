import { logger } from "../../config/logger";
import { db } from "../../db";
import { driver } from "../../db/schema";
import { eq } from "drizzle-orm";
import { DriverProfile, InitialDriverData } from "../../types";



export class DriverService {
    async createDriver(DriverData: InitialDriverData) {
        try {

            const { email, userId } = DriverData

            const existingUser = await db.select().from(driver).where(eq(driver.user_id, userId));
            logger.info({existingUser},'skhfskfh')
            if (existingUser.length >0) {
                logger.info({ existingUser }, 'driver already exitsing ')
                return
            }
            await db.insert(driver).values({
                user_id: userId,
                licenseNumber: "",
                licenseExpiry: new Date(),
                vehicleModel: "",
                vehiclePlate: "",
                name: "",
            })
            logger.info({ email }, "driver created")
        } catch (error) {
            logger.error({ error }, 'driver creattion faild')
            throw new Error('Failed to Driver creation');

        }
    };
    async updateDriverProfile(DriverData: DriverProfile) {
        try {

            const { name, licenseNumber, licenseExpiry, vehicleModel, vehiclePlate, userId } = DriverData

           const existingUser = await db.select().from(driver).where(eq(driver.user_id, userId));
            if (existingUser.length === 0) {
                logger.info({ existingUser }, 'driver not found')
                return
            }
            await db.update(driver).set({
                licenseNumber: licenseNumber,
                licenseExpiry: licenseExpiry,
                vehicleModel: vehicleModel,
                vehiclePlate: vehiclePlate,
                name: name,
            }).where(eq(driver.user_id, userId))
            const updatedUser = await db.select().from(driver).where(eq(driver.user_id, userId));
            logger.info({ userId }, "driver profile updated")
            return updatedUser

        } catch (error) {
            logger.error({ error }, 'driver profile update faild')
            throw new Error('Failed to Driver profile update');

        }
    }
}