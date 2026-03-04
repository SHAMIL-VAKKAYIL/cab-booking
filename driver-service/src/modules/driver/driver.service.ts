import { logger } from "../../config/logger";
import { db } from "../../db";
import { driver } from "../../db/schema";
import { eq } from "drizzle-orm";

interface InitialDriverData {
    email: string
    userId: string;
}

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
            })
            logger.info({ email }, "driver created")
        } catch (error) {
            logger.error({ error }, 'driver creattion faild')
            throw new Error('Failed to Driver creation');

        }
    }
}