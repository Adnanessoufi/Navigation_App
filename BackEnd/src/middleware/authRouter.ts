import jwt from "jsonwebtoken";
import express, { Request, Response, NextFunction } from "express";


interface AuthRequest extends Request {
  cookies: any;
  userId?: string;
}

const COOKIE_NAME = "auth";
const isProd = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET!;


function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { uid: string };
    req.userId = decoded.uid;
    req.userRole = decoded.role ?? "USER"
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default requireAuth;