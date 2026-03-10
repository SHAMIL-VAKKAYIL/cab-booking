import express from "express";
import { logger } from "../../config/logger";
import { DriverService } from "./driver.service";


const driverService = new DriverService()

export const profileCreation = async (req: express.Request, res: express.Response) => {
    const { name, licenseNumber, licenseExpiry, vehicleModel, vehiclePlate } = req.body
    const userId = req.headers['user-id'] as string
    try {
        const driverData =  await driverService.updateDriverProfile({ name, licenseNumber, licenseExpiry, vehicleModel, vehiclePlate,userId })
        return res.status(200).json({ message: "Driver profile created successfully", driverData });
        
    } catch (error) {
        logger.error({ error }, "Error in driver profile creation");
        return res.status(500).json({ message: "Failed to create driver profile" });
    }

}