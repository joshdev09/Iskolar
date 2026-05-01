import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerHandlers } from "./socketHandlers";
import { createSession, getSession, getSessionByCode } from "./sessionManager";

const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());

// ─── REST API ──────────────────────────────────────────────────────────────────

app.post("/api/session", async (req, res) => {
  const { hostId, quiz } = req.body;
  if (!hostId || !Array.isArray(quiz) || quiz.length === 0) {
    return res.status(400).json({ error: "hostId and quiz[] are required." });
  }
  try {
    const session = await createSession(hostId, quiz);
    res.json({ sessionId: session.sessionId, joinCode: session.joinCode });
  } catch (err: any) {
    console.error("[/api/session POST]", err.message);
    res.status(500).json({ error: "Failed to create session." });
  }
});

app.get("/api/session/:id", async (req, res) => {
  try {
    const session = await getSession(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found." });
    const safeQuiz = session.quiz.map(({ answer: _a, ...rest }: any) => rest);
    res.json({ ...session, quiz: safeQuiz });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/session/code/:code", async (req, res) => {
  try {
    const session = await getSessionByCode(req.params.code);
    if (!session) return res.status(404).json({ error: "Invalid join code." });
    res.json({ sessionId: session.sessionId, status: session.status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Socket.IO ─────────────────────────────────────────────────────────────────

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

registerHandlers(io);

// ─── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 ISKOLAR server running on http://localhost:${PORT}`);
});