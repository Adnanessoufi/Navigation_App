import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import requireAuth from "../middleware/authRouter";
import type { AuthRequest } from "../middleware/authRouter";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { place: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ favorites });
  } catch (error) {
    console.error("GET /api/favorites error", error);
    return res.status(500).json({ message: "Error loading favorites" });
  }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { placeId } = req.body as { placeId?: string };

    if (!placeId) {
      return res.status(400).json({ message: "placeId is required" });
    }

    const favorite = await prisma.favorite.upsert({
      where: { userId_placeId: { userId, placeId } },
      update: {},
      create: { userId, placeId },
    });

    return res.status(201).json({ message: "Favorite added", favorite });
  } catch (error) {
    console.error("POST /api/favorites error", error);
    return res.status(500).json({ message: "Error adding favorite" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const placeId = req.params.id;

    await prisma.favorite.deleteMany({
      where: { userId, placeId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE /api/favorites/:id error", error);
    return res.status(500).json({ message: "Error removing favorite" });
  }
});

export default router;
