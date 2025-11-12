import "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    role?: "USER" | "ADMIN";
    user?: { id: string; role: "ADMIN" | "USER" };
  }
}