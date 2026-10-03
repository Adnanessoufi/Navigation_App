import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import requireAuth, { AuthRequest } from "../middleware/authRouter";

const router = express.Router();

const COOKIE_NAME = "auth";
const isProd = process.env.NODE_ENV === "production";
const JWT_EXPIRES: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES as SignOptions["expiresIn"]) || "1d";

router.use(cookieParser());

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    let { username, email, password } = req.body as {
      username: string;
      email: string;
      password: string;
    };

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = String(email).trim().toLowerCase();
    username = String(username).trim();

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        name: username,
        passwordHash,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    const token = jwt.sign(
      { uid: newUser.id, role: newUser.role },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES },
    );

    setAuthCookie(res, token);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/profile", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  clearAuthCookie(res);
  return res.json({ message: "Logged out successfully" });
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    email = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { uid: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES },
    );

    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
