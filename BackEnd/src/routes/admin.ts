import { Router } from "express";
import { prisma } from "../lib/prisma";
import requireAuth from "../middleware/authRouter";
import requireAdmin from "../middleware/requireAdmin";
import { Prisma, PlaceStatus } from "../generated/prisma";

const router = Router();

router.use(requireAuth, requireAdmin);



router.get("/places/pending", async (req, res) => {
  try {
    const qRaw = (req.query.q as string | undefined)?.trim() ?? "";
    const skip = Math.max(0, Number(req.query.skip) || 0);
    const take = Math.min(Math.max(1, Number(req.query.take) || 50), 100);

   const where: Prisma.PlaceWhereInput = {
  status: PlaceStatus.PENDING,
  ...(qRaw
    ? {
        OR: [
          { name: { contains: qRaw, mode: Prisma.QueryMode.insensitive } },
          { abbr: { contains: qRaw, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {}),
};

    const [items, total] = await Promise.all([
      prisma.place.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take,
        select: {
          id: true, name: true, abbr: true,
          type: true, lat: true, lng: true,
          status: true, createdBy: { select: { id: true, name: true, email: true } },
          createdById: true, approvedById: true, approvedAt: true,
        },
      }),
      prisma.place.count({ where }),
    ]);

    res.json({ total, skip, take, results: items });
  } catch (e) {
    console.error("admin list pending error", e);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/admin/places/:id/approve
 * Body: { }
 */
router.post("/places/:id/approve", async (req, res) => {
  try {
    const id = req.params.id;
    const adminId = req.userId!;
    const updated = await prisma.place.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById: adminId,
        approvedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        abbr: true,
        type: true,
        lat: true,
        lng: true,
        status: true,
        approvedById: true,
        approvedAt: true,
      },
    });
    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Place not found" });
    console.error("admin approve error", e);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/admin/places/:id/reject
 * Body: { }  // (optionally you can add { reason: string } and store in a moderation log table later)
 */
router.post("/places/:id/reject", async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await prisma.place.update({
      where: { id },
      data: {
        status: "REJECTED",
        approvedById: null,
        approvedAt: null,
      },
      select: {
        id: true,
        name: true,
        abbr: true,
        type: true,
        lat: true,
        lng: true,
        status: true,
        approvedById: true,
        approvedAt: true,
      },
    });
    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Place not found" });
    console.error("admin reject error", e);
    res.status(500).json({ error: "Server error" });
  }
});

// --- USERS ADMIN ENDPOINTS ---

/**
 * GET /api/admin/users
 * Query:
 *  - q?: string  (search by name OR email, case-insensitive)
 *  - skip?: number (default 0)
 *  - take?: number (default 50, max 100)
 */
router.get("/users", async (req, res) => {
  try {
    const qRaw = (req.query.q as string | undefined)?.trim() ?? "";
    const skip = Math.max(0, Number(req.query.skip) || 0);
    const take = Math.min(Math.max(1, Number(req.query.take) || 50), 100);

    const where: Prisma.UserWhereInput = qRaw
      ? {
          OR: [
            { name:  { contains: qRaw, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: qRaw, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          // count how many places they added
          _count: { select: { placesCreated: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const results = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role, // "USER" | "ADMIN"
      totalPlaces: u._count.placesCreated,
    }));

    res.json({ total, skip, take, results });
  } catch (e) {
    console.error("admin users list error", e);
    res.status(500).json({ error: "Server error" });
  }
});


/**
 * POST /api/admin/users/:id/make-admin
 * Body: {}
 * Effect: upgrades a user to ADMIN (idempotent)
 */
router.post("/users/:id/make-admin", async (req, res) => {
  try {
    const targetId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true, name: true, email: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "ADMIN") {
      // already admin; return as-is (idempotent)
      return res.json({ ...user, changed: false });
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: { role: "ADMIN" },
      select: { id: true, role: true, name: true, email: true },
    });

    res.json({ ...updated, changed: true });
  } catch (e: any) {
    console.error("make-admin error", e);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/admin/users/:id/places
 * Query:
 *  - status?: "PENDING" | "APPROVED" | "REJECTED" (optional filter)
 *  - skip?: number (default 0)
 *  - take?: number (default 50)
 */
router.get("/users/:id/places", async (req, res) => {
  try {
    const userId = req.params.id;
    const status = req.query.status as "PENDING" | "APPROVED" | "REJECTED" | undefined;
    const skip = Math.max(0, Number(req.query.skip) || 0);
    const take = Math.min(Math.max(1, Number(req.query.take) || 50), 100);

    // quick existence check (optional)
    const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!exists) return res.status(404).json({ error: "User not found" });

    const where = { createdById: userId, ...(status ? { status } : {}) };

    const [items, total, counts] = await Promise.all([
      prisma.place.findMany({
        where,
        orderBy: [{ status: "asc" }, { name: "asc" }],
        select: { id: true, name: true, abbr: true, type: true, lat: true, lng: true, status: true },
        skip,
        take,
      }),
      prisma.place.count({ where }),
      prisma.place.groupBy({
        by: ["status"],
        where: { createdById: userId },
        _count: { _all: true },
      }),
    ]);

    const byStatus = { PENDING: 0, APPROVED: 0, REJECTED: 0 } as Record<string, number>;
    for (const c of counts) byStatus[c.status] = c._count._all;

    res.json({ total, skip, take, byStatus, results: items });
  } catch (e) {
    console.error("admin users:id places error", e);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
