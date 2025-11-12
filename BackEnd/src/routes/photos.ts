import { Router } from "express";
import { prisma } from "../lib/prisma";
import { cloudinary } from "../lib/cloudinary";

const router = Router();

// GET /api/places/:placeId/photos
router.get("/:placeId/photos", async (req, res) => {
  try {
    const { placeId } = req.params;
    const photos = await prisma.placePhoto.findMany({
      where: {
        placeId,
        status: "APPROVED", 
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        url: true,
        caption: true,
        isPrimary: true,
        order: true,
      },
    });
    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

router.post("/:placeId/photos/sign", /* requireAuth, */ async (req, res) => {
  try {
    const { placeId } = req.params;

    const folder = `nav_a/places/${placeId}`;

    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    res.json({
      signature,
      timestamp,
      folder,
      cloudName: cloudinary.config().cloud_name || "Hi",
      apiKey: cloudinary.config().api_key || "Hello",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create upload signature" });
  }
});

router.post("/:placeId/photos", async (req, res) => {
  try {
    const { placeId } = req.params;
    const { url, publicId, caption } = req.body || {};

    if (!url) return res.status(400).json({ error: "url is required" });

    // Make the first photo primary automatically (nice UX)
    const count = await prisma.placePhoto.count({ where: { placeId } });
    const isPrimary = count === 0;

    const photo = await prisma.placePhoto.create({
      data: {
        placeId,
        url,
        publicId,
        caption,
        isPrimary,
        status: "APPROVED", // change to PENDING if you want moderation
      },
      select: { id: true, url: true, isPrimary: true, caption: true },
    });

    res.status(201).json(photo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save photo" });
  }
});

router.get("/:placeId/primaryPhoto", async (req, res) => {
  try {
    const { placeId } = req.params;
    const photo = await prisma.placePhoto.findFirst({
      where: { placeId, status: "APPROVED" },
      orderBy: [{ isPrimary: "desc" }, { order: "asc" }, { createdAt: "asc" }],
      select: { id: true, url: true, isPrimary: true },
    });
    res.json(photo); // can be null
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load primary photo" });
  }
});

export default router;
