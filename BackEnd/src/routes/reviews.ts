import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import requireAuth from "../middleware/authRouter";
import type { AuthRequest } from "../middleware/authRouter";
import requireAdmin from "../middleware/requireAdmin";

const router = Router();

// POST /reviews  → Add a review
router.post("/", requireAuth ,async (req: AuthRequest, res: Response) => {
  console.log("Received review submission:", req.body);
  try {
    const { placeId, rating, comment } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    if (!placeId ) {
      return res.status(400).json({ error: "Missing fields" });
    }


    if (!rating ) {
      return res.status(400).json({ error: "Please select a star rating." });
    }

    const review = await prisma.review.create({
      data: {
        placeId: String(placeId), rating: Number(rating),
        comment: String(comment), userId,
      },
    });

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add review" });
  }
});

// GET /reviews?placeId=...
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

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.delete("/:id", requireAuth, (req, res, next) => { 
  (req as any).userRole = (req as any).role;
  next();
}, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await prisma.review.delete({
      where: { id },
    });

    return res.json({ ok: true, review: deleted });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({ error: "Review not found" });
    }
    console.error("DELETE /reviews/:id error:", err);
    return res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
