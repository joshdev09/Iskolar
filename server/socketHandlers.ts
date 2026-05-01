import type { Server, Socket } from "socket.io";
import * as sm from "./sessionManager";
import { calculateScore } from "./scoreEngine";

async function buildLeaderboard(sessionId: string) {
  return (await sm.getSortedLeaderboard(sessionId))
    .filter((p) => p.nickname !== "__host__")
    .map((p, i) => ({
      rank: i + 1,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      delta: 0,
    }));
}

export function registerHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ── Host joins ────────────────────────────────────────────────────────────
    socket.on("host_join", async ({ sessionId }: { sessionId: string }) => {
      socket.join(sessionId);
      socket.data.sessionId = sessionId;
      socket.data.isHost = true;

      const session = await sm.getSession(sessionId);
      if (!session) return;

      const visiblePlayers = session.players.filter((p) => p.nickname !== "__host__");
      socket.emit("player_joined", { players: visiblePlayers, nickname: "" });

      if (session.status === "playing") {
        const q = session.quiz[session.currentIndex] as any;
        socket.emit("host_question_update", {
          question: { question: q.question, options: q.options },
          index: session.currentIndex,
          total: session.quiz.length,
          startedAt: session.questionStartedAt,
        });
        socket.emit("leaderboard_update", await buildLeaderboard(sessionId));
      }
    });

    // ── Player joins ──────────────────────────────────────────────────────────
    socket.on("join_session", async ({ sessionId, nickname, avatar }: any) => {
      const existingSession = await sm.getSession(sessionId);
      const existingPlayer = existingSession?.players.find((p) => p.nickname === nickname);

      let session;
      if (existingPlayer) {
        await sm.updatePlayerId(sessionId, nickname, socket.id);
        session = await sm.getSession(sessionId);
      } else {
        session = await sm.addPlayer(sessionId, { id: socket.id, nickname, avatar });
      }

      if (!session) { socket.emit("error", { message: "Session not found." }); return; }
      if (session.status === "finished") { socket.emit("error", { message: "This quiz has already ended." }); return; }

      socket.join(sessionId);
      socket.data.sessionId = sessionId;
      socket.data.nickname = nickname;

      const visiblePlayers = session.players.filter((p) => p.nickname !== "__host__");
      io.to(sessionId).emit("player_joined", { players: visiblePlayers, nickname });
      socket.emit("session_state", {
        status: session.status,
        players: visiblePlayers,
        currentIndex: session.currentIndex,
        total: session.quiz.length,
      });

      if (session.status === "playing") {
        const safeQuestions = session.quiz.map((q: any, index: number) => ({
          question: { question: q.question, options: q.options },
          index,
          total: session.quiz.length,
          startedAt: session.questionStartedAt,
        }));
        socket.emit("game_started", { questions: safeQuestions, total: session.quiz.length });
        socket.emit("leaderboard_update", await buildLeaderboard(sessionId));
      }
    });

    // ── Start game ────────────────────────────────────────────────────────────
    socket.on("start_game", async ({ sessionId }: { sessionId: string }) => {
      const session = await sm.getSession(sessionId);
      if (!session || session.status === "playing") return;

      const now = Date.now();
      await sm.updateSession(sessionId, { status: "playing", currentIndex: 0, questionStartedAt: now });

      const safeQuestions = session.quiz.map((q: any, index: number) => ({
        question: { question: q.question, options: q.options },
        index,
        total: session.quiz.length,
        startedAt: now,
      }));

      io.to(sessionId).emit("game_started", { questions: safeQuestions, total: session.quiz.length });
    });

    // ── Next question (host-controlled) ───────────────────────────────────────
    socket.on("next_question", async ({ sessionId }: { sessionId: string }) => {
      const session = await sm.getSession(sessionId);
      if (!session || session.status !== "playing") return;

      const next = session.currentIndex + 1;
      if (next >= session.quiz.length) {
        await sm.updateSession(sessionId, { status: "finished" });
        io.to(sessionId).emit("game_finished", { leaderboard: await buildLeaderboard(sessionId) });
        return;
      }

      const now = Date.now();
      await sm.updateSession(sessionId, { currentIndex: next, questionStartedAt: now });

      const q = session.quiz[next] as any;
      io.to(sessionId).emit("host_question_update", {
        question: { question: q.question, options: q.options },
        index: next,
        total: session.quiz.length,
        startedAt: now,
      });
    });

    // ── Submit answer ─────────────────────────────────────────────────────────
    socket.on("submit_answer", async ({ sessionId, answer, playerId, questionIndex }: any) => {
      const session = await sm.getSession(sessionId);
      if (!session || session.status !== "playing") return;

      if (Math.abs(questionIndex - session.currentIndex) > 1) return;

      const currentQ = session.quiz[questionIndex] as any;
      if (!currentQ) return;

      if (await sm.hasPlayerAnswered(sessionId, playerId, questionIndex)) return;

      const correctAnswer = currentQ.correctAnswer ?? currentQ.answer;
      const isCorrect = correctAnswer === answer;
      const points = calculateScore(isCorrect, session.questionStartedAt!);

      await sm.applyAnswer(sessionId, playerId, points, isCorrect, questionIndex);

      socket.emit("answer_result", { isCorrect, points, correctAnswer });
      io.to(sessionId).emit("leaderboard_update", await buildLeaderboard(sessionId));

      if (questionIndex === session.quiz.length - 1 && await sm.allPlayersAnswered(sessionId, questionIndex)) {
        await sm.updateSession(sessionId, { status: "finished" });
        io.to(sessionId).emit("game_finished", { leaderboard: await buildLeaderboard(sessionId) });
      }
    });

    // ── End session ───────────────────────────────────────────────────────────
    socket.on("end_session", async ({ sessionId }: { sessionId: string }) => {
      await sm.updateSession(sessionId, { status: "finished" });
      io.to(sessionId).emit("game_finished", { leaderboard: await buildLeaderboard(sessionId) });
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      console.log(`[socket] disconnected: ${socket.id} from session ${sessionId}`);
      io.to(sessionId).emit("player_disconnected", { playerId: socket.id });
    });
  });
}