import { Router } from "express";
import { prisma } from "../lib/prisma";
import requireAuth from "../middleware/authRouter";


const router = Router();

function escapeRx(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.post("/",requireAuth, async (req, res) => {
  try {
    const { name, abbr, type, lat, lng } = req.body || {};
    if (!name || typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "name, lat, lng are required" });
    }
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const isAdmin = req.userRole === "ADMIN";

    const place = await prisma.place.create({
      data: { name, abbr: abbr || null, type: type || null, lat, lng,createdById: req.userId,
        status: isAdmin ? "APPROVED" : "PENDING", approvedById: isAdmin ? req.userId : null,
        approvedAt:   isAdmin ? new Date() : null,
       },
      select: { id: true, name: true, abbr: true, type: true, lat: true, lng: true, status: true },
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
        status: "APPROVED", 
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { abbr: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, abbr: true, type: true, lat: true, lng: true },
    });

    function score(p: { name: string | null; abbr: string | null }) {
      const name = (p.name ?? "").toLowerCase();
      const abbr = (p.abbr ?? "").toLowerCase();

      let s = 0;

      if (abbr === q) s += 100;
      if (`ik-${abbr}` === q) s += 95;

      if (name.startsWith(q)) s += 80;
      if (abbr.startsWith(q)) s += 70;

      if (name.includes(q)) s += 50;
      if (abbr.includes(q)) s += 40;

      return s;
    }

    const ranked = prelim
      .map(p => ({ ...p, _score: score(p) }))
      .sort((a, b) => (b._score - a._score) || a.name.localeCompare(b.name))
      .map(({ _score, ...p }) => p);

    const finalResults = ranked.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);

    res.json({ q: qRaw, count: finalResults.length, results: finalResults });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
