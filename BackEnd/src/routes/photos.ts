import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { cloudinary } from "../lib/cloudinary";
import requireAuth from "../middleware/authRouter";
import type { AuthRequest } from "../middleware/authRouter";

const router = Router();

router.get("/:placeId/photos", async (req, res) => {
  try {
    const { placeId } = req.params;
    const photos = await prisma.placePhoto.findMany({
      where: { placeId, status: "APPROVED" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        url: true,
        caption: true,
        isPrimary: true,
        order: true,
      },
    });

    return res.json(photos);
  } catch (error) {
    console.error("GET place photos error", error);
    return res.status(500).json({ error: "Failed to fetch photos" });
  }
});

router.post(
  "/:placeId/photos/sign",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { placeId } = req.params;
      const timestamp = Math.round(Date.now() / 1000);
      const folder = `nav_a/places/${placeId}`;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!apiSecret) {
        return res.status(500).json({ error: "Cloudinary is not configured" });
      }

      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        apiSecret,
      );

      return res.json({
        signature,
        timestamp,
        folder,
        cloudName: cloudinary.config().cloud_name,
        apiKey: cloudinary.config().api_key,
      });
    } catch (error) {
      console.error("Create upload signature error", error);
      return res.status(500).json({ error: "Failed to create upload signature" });
    }
  },
);

router.post(
  "/:placeId/photos",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { placeId } = req.params;
      const { url, publicId, caption } = req.body || {};

      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "url is required" });
      }

      const count = await prisma.placePhoto.count({ where: { placeId } });
      const isPrimary = count === 0;

      const photo = await prisma.placePhoto.create({
        data: {
          placeId,
          url,
          publicId: publicId || null,
          caption: caption || null,
          isPrimary,
          status: "APPROVED",
          createdById: req.userId,
        },
        select: { id: true, url: true, isPrimary: true, caption: true },
      });

      return res.status(201).json(photo);
    } catch (error) {
      console.error("Save photo error", error);
      return res.status(500).json({ error: "Failed to save photo" });
    }
  },
);

router.get("/:placeId/primaryPhoto", async (req, res) => {
  try {
    const { placeId } = req.params;
    const photo = await prisma.placePhoto.findFirst({
      where: { placeId, status: "APPROVED" },
      orderBy: [
        { isPrimary: "desc" },
        { order: "asc" },
        { createdAt: "asc" },
      ],
      select: { id: true, url: true, isPrimary: true },
    });

    return res.json(photo);
  } catch (error) {
    console.error("GET primary photo error", error);
    return res.status(500).json({ error: "Failed to load primary photo" });
  }
});

export default router;
