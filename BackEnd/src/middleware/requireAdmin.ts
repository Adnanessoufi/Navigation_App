import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authRouter";

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin only" });
  }

  return next();
}

export default requireAdmin;
