import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { logger } from "./logger";

export interface JwtPayload {
  userId: string;
  role: "RIDER" | "DRIVER" | "ADMIN";
  email: string;
  exp: number;
  iat: number;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  logger.info({ token }, "token");

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    logger.info({ decoded }, "jwt verification success");
    req.headers["user-id"] = decoded.userId;
    req.headers["user-role"] = decoded.role;
    req.headers["user-email"] = decoded.email;

    delete req.headers["authorization"];

    next();
  } catch (err) {
    //  logger.error({err},'jwt verification failed')
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (...roles: JwtPayload["role"][]) => {
  logger.info({ roles }, "roles");
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.headers["user-role"] as string;
    logger.info({ role }, "role");
    // Case-insensitive check
    const hasRole = roles
      .map((r) => r.toUpperCase())
      .includes(role?.toUpperCase());

    if (!hasRole) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
