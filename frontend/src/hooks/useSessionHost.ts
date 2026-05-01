import { useCallback, useEffect, useState } from "react";
import { getSocket, connectSocket } from "@/services/socket";
import type { Player, LeaderboardEntry, QuestionStartedData } from "@/types/multiplayer";

interface UseSessionHostOptions {
  sessionId: string;
}

export function useSessionHost({ sessionId }: UseSessionHostOptions) {
  const [players, setPlayers]                 = useState<Player[]>([]);
  const [leaderboard, setLeaderboard]         = useState<LeaderboardEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionStartedData | null>(null);
  const [currentIndex, setCurrentIndex]       = useState(0);
  const [totalQuestions, setTotalQuestions]   = useState(0);
  const [isPlaying, setIsPlaying]             = useState(false);
  const [isFinished, setIsFinished]           = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const socket = getSocket();
    connectSocket();

    // Pre-load players from REST in case they joined before host connected
    fetch(`/api/session/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        const visible = (data.players ?? []).filter(
          (p: Player) => p.nickname !== "__host__"
        );
        setPlayers(visible);
        setTotalQuestions(data.quiz?.length ?? 0);
      })
      .catch(console.error);

    // BUG FIX: emit host_join on both initial connect AND reconnects
    const onConnect = () => {
      socket.emit("host_join", { sessionId });
    };

    socket.on("connect", onConnect);
    if (socket.connected) onConnect();

    socket.on("player_joined", ({ players: p }: { players: Player[] }) => {
      setPlayers(p.filter((pl) => pl.nickname !== "__host__"));
    });

    socket.on("game_started", ({ questions, total }: any) => {
      setIsPlaying(true);
      setTotalQuestions(total);
      if (questions?.length > 0) {
        setCurrentQuestion(questions[0]);
        setCurrentIndex(0);
      }
    });

    // BUG FIX: host_question_update also carries index — track it for the host view
    socket.on("host_question_update", (data: QuestionStartedData) => {
      setCurrentQuestion(data);
      setCurrentIndex(data.index);
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
      socket.off("connect", onConnect);
      socket.off("player_joined");
      socket.off("game_started");
      socket.off("host_question_update");
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
    currentIndex,
    totalQuestions,
    isPlaying,
    isFinished,
    finalLeaderboard,
    startGame,
    nextQuestion,
    endSession,
  };
}