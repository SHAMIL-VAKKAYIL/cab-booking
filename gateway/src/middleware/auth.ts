import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface JwtPayload {
  sub: string;
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

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    req.headers["user-id"] = decoded.sub;
    req.headers["user-role"] = decoded.role;
    req.headers["user-email"] = decoded.email;

    delete req.headers["authorization"];

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (...roles: JwtPayload["role"][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.headers["user-role"] as string;
    if (!roles.includes(role as JwtPayload["role"])) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
