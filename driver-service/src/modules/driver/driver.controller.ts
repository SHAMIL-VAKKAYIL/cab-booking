import { Request, Response, NextFunction } from "express";
import { DriverService } from "./driver.service";
import { logger } from "../../config/logger";

const driverService = new DriverService();

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.headers["user-id"] as string;
    const result = await driverService.getProfile(userId);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.headers["user-id"] as string;
    const { name, phone, licenseNumber, licenseExpiry } = req.body;

    const result = await driverService.updateProfile({
      userId,
      name,
      phone,
      licenseNumber,
      licenseExpiry:
        licenseExpiry !== undefined ? new Date(licenseExpiry) : undefined,
    });

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.headers["user-id"] as string;
    const { vehicleModel, vehiclePlate, vehicleType } = req.body;
    logger.info(req.body);

    const allowedVehicleTypes = ["ECONOMY", "PREMIUM"];
    if (
      vehicleType !== undefined &&
      !allowedVehicleTypes.includes(vehicleType)
    ) {
      return res.status(400).json({
        error: `Invalid vehicleType. Allowed values: ${allowedVehicleTypes.join(", ")}`,
      });
    }

    const result = await driverService.updateVehicle({
      userId,
      vehicleModel,
      vehiclePlate,
      vehicleType,
    });

    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const toggleAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.headers["user-id"] as string;
    const { lat, lng } = req.body;

    const result = await driverService.toggleAvailability({ userId, lat, lng });
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const getRating = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.headers["user-id"] as string;
    const result = await driverService.getRating(userId);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};
