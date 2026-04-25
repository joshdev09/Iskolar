import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket, connectSocket } from "@/services/socket";
import type {
  LeaderboardEntry,
  Player,
  QuestionStartedData,
  AnswerResultData,
} from "@/types/multiplayer";

interface UseMultiplayerQuizOptions {
  sessionId: string;
  nickname: string;
  avatar: string;
}

export function useMultiplayerQuiz({
  sessionId,
  nickname,
  avatar,
}: UseMultiplayerQuizOptions) {
  const [players, setPlayers]                   = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion]   = useState<QuestionStartedData | null>(null);
  const [leaderboard, setLeaderboard]           = useState<LeaderboardEntry[]>([]);
  const [answerResult, setAnswerResult]         = useState<AnswerResultData | null>(null);
  const [isFinished, setIsFinished]             = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hasAnswered, setHasAnswered]           = useState(false);
  const [timeLeft, setTimeLeft]                 = useState(20);
  const [sessionStatus, setSessionStatus]       = useState<"waiting" | "playing" | "finished">("waiting");
  const [isConnected, setIsConnected]           = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  // ── Timer ────────────────────────────────────────────────────────────────────

  function startTimer(startedAt: number) {
    startedAtRef.current = startedAt;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const remaining = Math.max(0, 20 - elapsed);
      setTimeLeft(Math.ceil(remaining));
      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 200);
  }

  // ── Socket setup ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const socket = getSocket();
    connectSocket();

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join_session", { sessionId, nickname, avatar });
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("session_state", ({ status, players: p }: any) => {
      setSessionStatus(status);
      setPlayers(p.filter((pl: Player) => pl.nickname !== "__host__"));
    });

    socket.on("player_joined", ({ players: p }: { players: Player[] }) => {
      setPlayers(p.filter((pl) => pl.nickname !== "__host__"));
    });

    socket.on("game_started", (data: QuestionStartedData) => {
      setSessionStatus("playing");
      setCurrentQuestion(data);
      setAnswerResult(null);
      setHasAnswered(false);
      setTimeLeft(20);
      startTimer(data.startedAt);
    });

    socket.on("question_started", (data: QuestionStartedData) => {
      setCurrentQuestion(data);
      setAnswerResult(null);
      setHasAnswered(false);
      setTimeLeft(20);
      startTimer(data.startedAt);
    });

    socket.on("answer_result", (result: AnswerResultData) => {
      setAnswerResult(result);
      if (timerRef.current) clearInterval(timerRef.current);
    });

    socket.on("leaderboard_update", (entries: LeaderboardEntry[]) => {
      setLeaderboard(entries);
    });

    socket.on("game_finished", ({ leaderboard: lb }: { leaderboard: LeaderboardEntry[] }) => {
      setIsFinished(true);
      setSessionStatus("finished");
      setFinalLeaderboard(lb);
      if (timerRef.current) clearInterval(timerRef.current);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("session_state");
      socket.off("player_joined");
      socket.off("game_started");
      socket.off("question_started");
      socket.off("answer_result");
      socket.off("leaderboard_update");
      socket.off("game_finished");
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId, nickname, avatar]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const submitAnswer = useCallback(
    (answer: string) => {
      if (hasAnswered) return;
      const socket = getSocket();
      const playerId = socket.id ?? "";
      setHasAnswered(true);
      socket.emit("submit_answer", { sessionId, answer, playerId });
    },
    [sessionId, hasAnswered]
  );

  return {
    players,
    currentQuestion,
    leaderboard,
    answerResult,
    isFinished,
    finalLeaderboard,
    hasAnswered,
    timeLeft,
    sessionStatus,
    isConnected,
    submitAnswer,
  };
}
