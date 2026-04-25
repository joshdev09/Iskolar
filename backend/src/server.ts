import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import notesRouter from "./routes/notes";
import quizRouter from "./routes/quiz";

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", notesRouter);
app.use("/api", quizRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => {
  console.log(`✅ Iskolar backend running at http://localhost:${PORT}`);
});
