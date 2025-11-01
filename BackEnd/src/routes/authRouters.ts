import express, { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import cookieParser from "cookie-parser";

const router = express.Router();

const COOKIE_NAME = "auth";
const isProd = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES as unknown as SignOptions["expiresIn"]) || "1d";

router.use(cookieParser());

interface AuthRequest extends Request {
  userId?: string;
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

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { uid: string };
    req.userId = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
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

    const ExistedUser = await prisma.user.findUnique({ where: { email } });
    if (ExistedUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        name: username,
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    });
    const token = jwt.sign({ uid: newUser.id }, JWT_SECRET as string, {
      expiresIn: JWT_EXPIRES,
    });
    setAuthCookie(res, token);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, username: newUser.name, email: newUser.email },
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
      select: { id: true, email: true, name: true }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out successfully" });
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
    password = password.trim();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email not found, Please Try again" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ uid: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });
    setAuthCookie(res, token);
    res.json({
      user: { id: user.id, username: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
