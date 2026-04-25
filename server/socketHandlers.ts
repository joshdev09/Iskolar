import type { Server, Socket } from "socket.io";
import * as sm from "./sessionManager";
import { calculateScore } from "./scoreEngine";
import type {
  JoinSessionPayload,
  StartGamePayload,
  NextQuestionPayload,
  SubmitAnswerPayload,
} from "../frontend/src/types/multiplayer";

// ─── Leaderboard Builder ───────────────────────────────────────────────────────

function buildLeaderboard(sessionId: string) {
  return sm.getSortedLeaderboard(sessionId).map((p, i) => ({
    rank: i + 1,
    nickname: p.nickname,
    avatar: p.avatar,
    score: p.score,
    delta: 0, // delta tracked client-side from previous snapshot
  }));
}

// ─── Socket Handlers ───────────────────────────────────────────────────────────

export function registerHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ── Join session ────────────────────────────────────────────────────────────
    socket.on("join_session", (payload: JoinSessionPayload) => {
      const { sessionId, nickname, avatar } = payload;
      const session = sm.addPlayer(sessionId, { id: socket.id, nickname, avatar });

      if (!session) {
        socket.emit("error", { message: "Session not found." });
        return;
      }
      if (session.status === "finished") {
        socket.emit("error", { message: "This quiz has already ended." });
        return;
      }

      socket.join(sessionId);
      socket.data.sessionId = sessionId;
      socket.data.nickname = nickname;

      // Tell everyone in the room about the new player list
      io.to(sessionId).emit("player_joined", {
        players: session.players,
        nickname,
      });

      // Tell the joining player the current session state
      socket.emit("session_state", {
        status: session.status,
        players: session.players,
        currentIndex: session.currentIndex,
        total: session.quiz.length,
      });
    });

    // ── Host: start game ────────────────────────────────────────────────────────
    socket.on("start_game", (payload: StartGamePayload) => {
      const { sessionId } = payload;
      const session = sm.getSession(sessionId);
      if (!session) return;

      sm.resetAnsweredFlags(sessionId);
      const now = Date.now();
      sm.updateSession(sessionId, {
        status: "playing",
        currentIndex: 0,
        questionStartedAt: now,
      });

      io.to(sessionId).emit("game_started", {
        question: {
          ...session.quiz[0],
          answer: undefined, // never send the answer to clients
        },
        index: 0,
        total: session.quiz.length,
        startedAt: now,
      });
    });

    // ── Host: next question ─────────────────────────────────────────────────────
    socket.on("next_question", (payload: NextQuestionPayload) => {
      const { sessionId } = payload;
      const session = sm.getSession(sessionId);
      if (!session || session.status !== "playing") return;

      const next = session.currentIndex + 1;

      // No more questions → end game
      if (next >= session.quiz.length) {
        sm.updateSession(sessionId, { status: "finished" });
        io.to(sessionId).emit("game_finished", {
          leaderboard: buildLeaderboard(sessionId),
        });
        return;
      }

      sm.resetAnsweredFlags(sessionId);
      const now = Date.now();
      sm.updateSession(sessionId, {
        currentIndex: next,
        questionStartedAt: now,
      });

      io.to(sessionId).emit("question_started", {
        question: {
          ...session.quiz[next],
          answer: undefined,
        },
        index: next,
        total: session.quiz.length,
        startedAt: now,
      });
    });

    // ── Player: submit answer ───────────────────────────────────────────────────
    socket.on("submit_answer", (payload: SubmitAnswerPayload) => {
      const { sessionId, answer, playerId } = payload;
      const session = sm.getSession(sessionId);
      if (!session || session.status !== "playing") return;

      const currentQ = session.quiz[session.currentIndex];
      const isCorrect = currentQ.answer === answer;
      const points = calculateScore(isCorrect, session.questionStartedAt!);

      sm.applyAnswer(sessionId, playerId, points, isCorrect);

      // Private feedback to the answering player
      socket.emit("answer_result", {
        isCorrect,
        points,
        correctAnswer: currentQ.answer,
      });

      // Broadcast updated leaderboard to everyone in the room
      io.to(sessionId).emit("leaderboard_update", buildLeaderboard(sessionId));
    });

    // ── Host: end session manually ──────────────────────────────────────────────
    socket.on("end_session", ({ sessionId }: { sessionId: string }) => {
      sm.updateSession(sessionId, { status: "finished" });
      io.to(sessionId).emit("game_finished", {
        leaderboard: buildLeaderboard(sessionId),
      });
    });

    // ── Disconnect ──────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      console.log(`[socket] disconnected: ${socket.id} from session ${sessionId}`);
      // Players stay in session for rejoin support (score preserved)
      io.to(sessionId).emit("player_disconnected", { playerId: socket.id });
    });
  });
}
