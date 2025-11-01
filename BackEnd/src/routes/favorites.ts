import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";


interface AuthReq extends Request {
  user?: { id: string };
}

const COOKIE_NAME = "auth";
const JWT_SECRET = process.env.JWT_SECRET!;

function requireAuth(req: AuthReq, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { uid: string };
    req.user = { id: decoded.uid }; // match how token was created in authRouter
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
const router = Router();

router.use(cookieParser());

router.get("/", requireAuth, async (req: AuthReq, res: Response) => {
  const userId = req.user!.id;
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { place: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ favorites });
});

router.post("/", requireAuth, async (req: AuthReq, res: Response) => {
  const userId = req.user!.id;
  const { placeId } = req.body as { placeId: string };
  
  try {
    const newFavorite = await prisma.favorite.create({
      data: { userId, placeId },
    });
    return res.status(201).json({ message:"Favorite added", favorite: newFavorite });
  } catch (error) {
    return res.status(500).json({ message: "Error adding favorite" });
  }

});

router.delete("/:id", requireAuth, async (req: AuthReq, res: Response) => {
  const userId = req.user!.id;
  const placeId = req.params.id;

    try {
         await prisma.favorite.delete({
            where: { userId_placeId: { userId, placeId } },
        });
    } catch (error) {}
});

export default router;
