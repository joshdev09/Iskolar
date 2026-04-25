import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerHandlers } from "./socketHandlers";
import {
  createSession,
  getSession,
  getSessionByCode,
} from "./sessionManager";

const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());

// ─── REST API ──────────────────────────────────────────────────────────────────

// Create a new quiz session (called right after quiz generation)
app.post("/api/session", (req, res) => {
  const { hostId, quiz } = req.body;
  if (!hostId || !Array.isArray(quiz) || quiz.length === 0) {
    return res.status(400).json({ error: "hostId and quiz[] are required." });
  }
  const session = createSession(hostId, quiz);
  res.json({
    sessionId: session.sessionId,
    joinCode: session.joinCode,
  });
});

// Get session by ID
app.get("/api/session/:id", (req, res) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found." });
  const safeQuiz = session.quiz.map(({ answer: _a, ...rest }: { answer: any; [key: string]: any }) => rest);
  res.json({ ...session, quiz: safeQuiz });
});

// Look up session by join code
app.get("/api/session/code/:code", (req, res) => {
  const session = getSessionByCode(req.params.code);
  if (!session) return res.status(404).json({ error: "Invalid join code." });
  res.json({ sessionId: session.sessionId, status: session.status });
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
