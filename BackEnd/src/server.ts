import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import healthRouter from "./routes/health";
import searchRouter from "./routes/search";
import authRouters from "./routes/authRouters";
import favoriteRouter from "./routes/favorites";
import suggestsRouter from "./routes/suggest";
import adminRouter from "./routes/admin";
import meRouter from "./routes/me";
import photosRouter from "./routes/photos";
import reviewsRouter from "./routes/reviews";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use("/api/health", healthRouter);
app.use("/api/search", searchRouter);
app.use("/api/auth", authRouters);
app.use("/api/favorites", favoriteRouter);
app.use("/api/suggest", suggestsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/me", meRouter);
app.use("/api/places", photosRouter);
app.use("/api/reviews", reviewsRouter);

app.get("/", (_req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
