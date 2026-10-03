import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import requireAuth from "../middleware/authRouter";
import type { AuthRequest } from "../middleware/authRouter";
import requireAdmin from "../middleware/requireAdmin";

const router = Router();

router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { placeId, rating, comment } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!placeId) {
      return res.status(400).json({ error: "placeId is required" });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const review = await prisma.review.create({
      data: {
        placeId: String(placeId),
        rating: numericRating,
        comment: typeof comment === "string" ? comment.trim() : "",
        userId,
      },
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error("POST /api/reviews error", error);
    return res.status(500).json({ error: "Failed to add review" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ error: "placeId is required" });
    }

    const reviews = await prisma.review.findMany({
      where: { placeId: String(placeId) },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.json(reviews);
  } catch (error) {
    console.error("GET /api/reviews error", error);
    return res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const deleted = await prisma.review.delete({
        where: { id: req.params.id },
      });

      return res.json({ ok: true, review: deleted });
    } catch (error: any) {
      if (error?.code === "P2025") {
        return res.status(404).json({ error: "Review not found" });
      }

      console.error("DELETE /api/reviews/:id error", error);
      return res.status(500).json({ error: "Failed to delete review" });
    }
  },
);

export default router;
