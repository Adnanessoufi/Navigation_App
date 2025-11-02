import type { Request, Response, NextFunction } from "express";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.userRole !== "ADMIN") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

export default requireAdmin;
