import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  userId?: string;
  role?: "ADMIN" | "USER";
}

const COOKIE_NAME = "auth";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      uid: string;
      role: "ADMIN" | "USER";
    };

    req.userId = decoded.uid;
    req.role = decoded.role;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default requireAuth;
