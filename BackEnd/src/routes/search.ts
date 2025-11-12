import { Router } from "express";
import { prisma } from "../lib/prisma";
import requireAuth from "../middleware/authRouter";
import { PlaceStatus } from "../generated/prisma";
import requireAdmin from "../middleware/requireAdmin";

const router = Router();

function escapeRx(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.put("/:id/description", requireAuth,requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ message: "Invalid description" });
    }
    try {
      const place = await prisma.place.update({
        where: { id },
        data: { description: description === undefined ? null : description  },
        select: { id: true, description: true },
      });
      res.json(place);
    } catch (e) {
      console.error("Error updating place description:", e);
      res.status(500).json({ message: "Server error" });
    }



});

router.post("/",requireAuth, async (req, res) => {
  try {
    const { name, abbr, type, lat, lng, description } = req.body || {};
    if (!name || typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "name, lat, lng are required" });
    }
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const isAdmin = req.role === "ADMIN";

    const place = await prisma.place.create({
      data: { name, abbr: abbr || null, type: type || null, lat, lng,createdById: req.userId,
        status: isAdmin ? "APPROVED" : "PENDING", approvedById: isAdmin ? req.userId : null,
        approvedAt:   isAdmin ? new Date() : null,
        description: (typeof description === "string" && description.trim().length) ? description.trim() : null
       },
      select: { id: true, name: true, abbr: true, type: true, lat: true, lng: true, status: true, description: true},
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
    console.log("Search query:", qRaw);
    const typesParam = (req.query.types as string | undefined)?.trim() || "";
    const allowed = new Set(["LIBRARY" , "PRAYER ROOM" , "FOOD COURT" , "EDUCATIONAL OFFICES"]);
    const types = typesParam ? typesParam.split(",").map(s => s.trim()).filter(s => allowed.has(s.toUpperCase())) : [];

    const whereBase: any = { status: PlaceStatus.APPROVED };
    if (types.length) whereBase.AND = [
    {
      OR: types.map(t => ({ type: { contains: t, mode: "insensitive" } }))
    }
  ];

    if (!qRaw && types.length) {
      const rows = await prisma.place.findMany({
        where: whereBase,
        orderBy: { name: "asc" },
        select: { id: true, name: true, abbr: true, type: true, lat: true, lng: true },
      });
      return res.json({ q: qRaw, count: rows.length, results: rows });
    }

    if (!qRaw && !types.length) {
      return res.json({ q: qRaw, count: 0, results: [] });
    }

    const q = qRaw.toLowerCase();

    const prelim = await prisma.place.findMany({
      where: {
        ...whereBase,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { abbr: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, abbr: true, type: true, lat: true, lng: true, description: true },
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
