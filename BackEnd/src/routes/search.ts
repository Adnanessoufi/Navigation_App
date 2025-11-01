import { Router } from "express";
import { prisma } from "../lib/prisma";
import requireAuth from "./authRouters";

const router = Router();

function escapeRx(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, abbr, type, lat, lng } = req.body || {};
    if (!name || typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "name, lat, lng are required" });
    }

    const place = await prisma.place.create({
      data: { name, abbr: abbr || null, type: type || null, lat, lng },
      select: { id: true, name: true, abbr: true, type: true, lat: true, lng: true },
    });

    res.status(201).json(place);
  } catch (e) {
    console.error("create place error", e);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const qRaw = ((req.query.q as string) || "").trim();   
    if (!qRaw) return res.json({ q: qRaw, count: 0, results: [] });

    const q = qRaw.toLowerCase();

    const prelim = await prisma.place.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { abbr: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
    });

    const token = escapeRx(qRaw);
    const rx = new RegExp(`(^|[^A-Za-z0-9])${token}([^A-Za-z0-9]|$)`, "i");

    const results = prelim.filter(
      (p) => rx.test(p.name ?? "") || rx.test(p.abbr ?? "")
    );

    const exacts = prelim.filter(
      (p) =>
        (p.abbr ?? "").toLowerCase() === q ||
        (p.abbr ?? "").toLowerCase() === `ik-${q.toUpperCase()}`.toLowerCase()
    );

    const finalResults = [...exacts, ...results].filter(
      (p, i, arr) => arr.findIndex(x => x.id === p.id) === i
    );

    res.json({ q: qRaw, count: finalResults.length, results: finalResults });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
