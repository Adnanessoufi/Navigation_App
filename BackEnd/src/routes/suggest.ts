// routes/suggest.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();


router.get("/", async (req, res) => {
  const qRaw = (req.query.q as string || "").trim();
  const limit = 8;
  if (!qRaw) return res.json({ q: qRaw, count: 0, results: [] });

  try {
    const results = await prisma.place.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { name: { contains: qRaw, mode: "insensitive" } },
          { abbr: { contains: qRaw, mode: "insensitive" } },
        ],
      },
      orderBy: { abbr: "asc" }, 
      take: limit,
      select: { id: true, name: true, abbr: true, lat: true, lng: true },
    });

    res.json({ q: qRaw, count: results.length, results });
  } catch (e) {
    console.error("suggest error", e);
    res.status(500).json({ q: qRaw, count: 0, results: [], error: "Server error" });
  }
});

export default router;
