import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket, connectSocket } from "@/services/socket";
import type {
  LeaderboardEntry,
  Player,
  QuestionStartedData,
  AnswerResultData,
} from "@/types/multiplayer";

const QUESTION_DURATION_MS = 20_000;

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
  // ── State ─────────────────────────────────────────────────────────────────
  const [players, setPlayers]                 = useState<Player[]>([]);
  const [questions, setQuestions]             = useState<QuestionStartedData[]>([]);
  const [currentIndex, setCurrentIndex]       = useState(0);
  const [leaderboard, setLeaderboard]         = useState<LeaderboardEntry[]>([]);
  const [answerResult, setAnswerResult]       = useState<AnswerResultData | null>(null);
  const [answeredIndexes, setAnsweredIndexes] = useState<Set<number>>(new Set());
  const [isFinished, setIsFinished]           = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeLeft, setTimeLeft]               = useState(QUESTION_DURATION_MS / 1000);
  const [sessionStatus, setSessionStatus]     = useState<"waiting" | "playing" | "finished">("waiting");
  const [isConnected, setIsConnected]         = useState(false);
  const [totalQuestions, setTotalQuestions]   = useState(0);

  // ── Refs (avoid stale closures in timer callbacks) ────────────────────────
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(0);
  const questionsRef    = useRef<QuestionStartedData[]>([]);
  const totalRef        = useRef(0);
  const answeredRef     = useRef<Set<number>>(new Set());

  const hasAnsweredCurrent = answeredIndexes.has(currentIndex);
  const currentQuestion    = questions[currentIndex] ?? null;
  const isLastQuestion     = currentIndex === totalQuestions - 1;

  // ── Timer helpers ─────────────────────────────────────────────────────────

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  /**
   * BUG FIX: Previously the timer used a local Date.now() as its origin, which
   * means every client's timer started at a slightly different time (depending
   * on when the game_started event arrived). Now we use the server-sent
   * `startedAt` epoch from the question data so all clients derive the same
   * elapsed time and auto-advance at exactly the same moment.
   */
  function startTimerFromServerEpoch(serverStartedAt: number, questionIndex: number) {
    clearTimer();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - serverStartedAt;
      const remainingMs = Math.max(0, QUESTION_DURATION_MS - elapsed);
      setTimeLeft(Math.ceil(remainingMs / 1000));

      if (remainingMs <= 0) {
        clearTimer();
        advanceToNext(questionIndex);
      }
    }, 200);
  }

  /**
   * BUG FIX: Previously `goToNext` was called inside the setInterval callback
   * with a stale `fromIndex` captured at timer-start time. If the player
   * manually advanced (setting currentIndex via state) the timer still held
   * the old index — causing double-advances or skipped questions.
   *
   * Now `advanceToNext` only fires if `questionIndex` still matches the live
   * ref, preventing spurious advances from stale timer closures.
   */
  function advanceToNext(fromIndex: number) {
    // Guard: don't advance if we've already moved past this question
    if (fromIndex !== currentIndexRef.current) return;

    const nextIndex = fromIndex + 1;
    if (nextIndex >= totalRef.current) return;

    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    setAnswerResult(null);
    setTimeLeft(QUESTION_DURATION_MS / 1000);

    // BUG FIX: use the server-provided startedAt from the NEXT question's data
    // so the timer stays server-authoritative even for subsequent questions.
    const nextQuestion = questionsRef.current[nextIndex];
    const origin = nextQuestion?.startedAt ?? Date.now();
    startTimerFromServerEpoch(origin, nextIndex);
  }

  // ── Socket setup ──────────────────────────────────────────────────────────

  useEffect(() => {
    const socket = getSocket();
    connectSocket();

    // ── Connection ───────────────────────────────────────────────────────────
    const onConnect = () => {
      setIsConnected(true);
      // BUG FIX: emit join_session on every (re)connect so the server puts the
      // socket back into the room after a disconnect/reconnect cycle. Previously
      // this only happened once in the `connect` handler if the socket wasn't
      // already connected — reconnects after network blips left players in limbo.
      socket.emit("join_session", { sessionId, nickname, avatar });
    };

    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      onConnect();
    }

    // ── Session state (sent on join) ──────────────────────────────────────────
    socket.on("session_state", ({ status, players: p, total }: any) => {
      setSessionStatus(status);
      setTotalQuestions(total ?? 0);
      totalRef.current = total ?? 0;
      setPlayers(p.filter((pl: Player) => pl.nickname !== "__host__"));
    });

    // ── Player roster ─────────────────────────────────────────────────────────
    socket.on("player_joined", ({ players: p }: { players: Player[] }) => {
      setPlayers(p.filter((pl) => pl.nickname !== "__host__"));
    });

    // ── Game started ──────────────────────────────────────────────────────────
    socket.on(
      "game_started",
      ({ questions: qs, total }: { questions: QuestionStartedData[]; total: number }) => {
        setSessionStatus("playing");
        setQuestions(qs);
        questionsRef.current = qs;
        setTotalQuestions(total);
        totalRef.current = total;
        setCurrentIndex(0);
        currentIndexRef.current = 0;
        setAnsweredIndexes(new Set());
        answeredRef.current = new Set();
        setAnswerResult(null);
        setTimeLeft(QUESTION_DURATION_MS / 1000);

        // Use server epoch from the first question for authoritative timer
        startTimerFromServerEpoch(qs[0]?.startedAt ?? Date.now(), 0);
      }
    );

    // ── Answer result (private, sent only to this player) ────────────────────
    socket.on("answer_result", (result: AnswerResultData) => {
      setAnswerResult(result);
      // Timer keeps running — auto-advance still fires if player doesn't click Next
    });

    // ── Live leaderboard ──────────────────────────────────────────────────────
    socket.on("leaderboard_update", (entries: LeaderboardEntry[]) => {
      setLeaderboard(entries);
    });

    // ── Game over ─────────────────────────────────────────────────────────────
    socket.on("game_finished", ({ leaderboard: lb }: { leaderboard: LeaderboardEntry[] }) => {
      setIsFinished(true);
      setSessionStatus("finished");
      setFinalLeaderboard(lb);
      clearTimer();
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("session_state");
      socket.off("player_joined");
      socket.off("game_started");
      socket.off("answer_result");
      socket.off("leaderboard_update");
      socket.off("game_finished");
      clearTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, nickname, avatar]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const submitAnswer = useCallback(
    (answer: string) => {
      // BUG FIX: use the ref (not state) for idempotency check — state updates
      // are async, so two rapid clicks could both pass a stale `hasAnsweredCurrent`
      // check and submit duplicate answers.
      if (answeredRef.current.has(currentIndexRef.current)) return;

      const socket = getSocket();
      const playerId = socket.id ?? "";

      // Mark answered immediately (optimistic) before emitting
      const next = new Set(answeredRef.current).add(currentIndexRef.current);
      answeredRef.current = next;
      setAnsweredIndexes(new Set(next));

      socket.emit("submit_answer", {
        sessionId,
        answer,
        playerId,
        questionIndex: currentIndexRef.current,
      });
    },
    [sessionId]
  );

  /**
   * BUG FIX: Manual "Next" previously called goToNext(currentIndexRef.current)
   * unconditionally. If the timer fired at the same instant, both paths would
   * call goToNext and the index could jump by 2. Now we clear the timer before
   * advancing so the two paths are mutually exclusive.
   */
  const handleNext = useCallback(() => {
    if (!answeredRef.current.has(currentIndexRef.current)) return;
    clearTimer(); // prevent double-advance if timer fires simultaneously
    advanceToNext(currentIndexRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    players,
    currentQuestion,
    currentIndex,
    totalQuestions,
    leaderboard,
    answerResult,
    isFinished,
    finalLeaderboard,
    hasAnsweredCurrent,
    isLastQuestion,
    timeLeft,
    sessionStatus,
    isConnected,
    submitAnswer,
    handleNext,
  };
}