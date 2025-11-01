import "dotenv/config";
import express from "express";
import healthRouter from "./routes/health";
import searchRouter from "./routes/search";
import authRouters from "./routes/authRouters";
import favoriteRouter from "./routes/favorites";
import cors from "cors";
import suggestsRouter from "./routes/suggest";

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors({ origin: "http://localhost:5173" ,credentials:true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRouter);
app.use("/api/search", searchRouter);
app.use('/api/auth', authRouters);
app.use("/api/favorites", favoriteRouter);
app.use("/api/suggest", suggestsRouter);

app.get("/", (req, res) => {
  res.send({ status: "OK", message: "Backend is running" });
});

app.get('/ping', (req, res) => {
  res.json({ ok: true })
})


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});




