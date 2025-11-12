import type { Request, Response, NextFunction } from "express";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = req.role ?? req.user?.role;   
  console.log("requireAdmin:   reqRole", role);
  if (role !== "ADMIN") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

export default requireAdmin;
