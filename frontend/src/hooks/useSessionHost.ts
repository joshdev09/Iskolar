import { useCallback, useEffect, useState } from "react";
import { getSocket, connectSocket } from "@/services/socket";
import type { Player, LeaderboardEntry, QuestionStartedData } from "@/types/multiplayer";

interface UseSessionHostOptions {
  sessionId: string;
}

export function useSessionHost({ sessionId }: UseSessionHostOptions) {
  const [players, setPlayers]               = useState<Player[]>([]);
  const [leaderboard, setLeaderboard]       = useState<LeaderboardEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionStartedData | null>(null);
  const [isPlaying, setIsPlaying]           = useState(false);
  const [isFinished, setIsFinished]         = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const socket = getSocket();
    connectSocket();

    // Host joins the socket room without a nickname
    socket.emit("join_session", {
      sessionId,
      nickname: "__host__",
      avatar: "👑",
    });

    socket.on("player_joined", ({ players: p }: { players: Player[] }) => {
      setPlayers(p.filter((pl) => pl.nickname !== "__host__"));
    });

    socket.on("player_disconnected", () => {
      // Players stay in leaderboard; just update display
    });

    socket.on("game_started", (data: QuestionStartedData) => {
      setCurrentQuestion(data);
      setIsPlaying(true);
    });

    socket.on("question_started", (data: QuestionStartedData) => {
      setCurrentQuestion(data);
    });

    socket.on("leaderboard_update", (entries: LeaderboardEntry[]) => {
      setLeaderboard(entries);
    });

    socket.on("game_finished", ({ leaderboard: lb }: { leaderboard: LeaderboardEntry[] }) => {
      setFinalLeaderboard(lb);
      setIsFinished(true);
      setIsPlaying(false);
    });

    return () => {
      socket.off("player_joined");
      socket.off("player_disconnected");
      socket.off("game_started");
      socket.off("question_started");
      socket.off("leaderboard_update");
      socket.off("game_finished");
    };
  }, [sessionId]);

  const startGame = useCallback(() => {
    getSocket().emit("start_game", { sessionId });
  }, [sessionId]);

  const nextQuestion = useCallback(() => {
    getSocket().emit("next_question", { sessionId });
  }, [sessionId]);

  const endSession = useCallback(() => {
    getSocket().emit("end_session", { sessionId });
  }, [sessionId]);

  return {
    players,
    leaderboard,
    currentQuestion,
    isPlaying,
    isFinished,
    finalLeaderboard,
    startGame,
    nextQuestion,
    endSession,
  };
}
