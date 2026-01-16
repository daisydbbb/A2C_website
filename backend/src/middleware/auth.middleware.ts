import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/User.model";

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};
