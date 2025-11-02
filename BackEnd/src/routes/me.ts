import { Router } from "express";
import requireAuth from "../middleware/authRouter";
import { prisma } from "../lib/prisma";

const router = Router();

// must be logged in
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    console.error("GET /api/me error", e);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
