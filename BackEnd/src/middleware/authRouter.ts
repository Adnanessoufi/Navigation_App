import jwt from "jsonwebtoken";
import express, { Request, Response, NextFunction } from "express";


export interface AuthRequest extends Request {
  cookies: any;
  userId?: string;
  role?:  "ADMIN" | "USER" ;
}

const COOKIE_NAME = "auth";
const isProd = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET!;


function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = (req as AuthRequest).cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { uid: string; role: "ADMIN" | "USER"; } ;
    req.userId = decoded.uid;
    req.role = decoded.role ;
    req.user = { id: decoded.uid, role: decoded.role };
    return next(); 
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default requireAuth;