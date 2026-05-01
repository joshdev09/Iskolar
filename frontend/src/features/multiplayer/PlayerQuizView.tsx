import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useMultiplayerQuiz } from "@/hooks/useMultiplayerQuiz";
import { WaitingRoom } from "./WaitingRoom";
import { Leaderboard } from "./Leaderboard";

export function PlayerQuizView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { nickname, avatar } = (location.state as any) ?? {};

  if (!nickname || !sessionId) {
    navigate(`/join/${sessionId ?? ""}`);
    return null;
  }

  const {
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
  } = useMultiplayerQuiz({ sessionId, nickname, avatar });

  // ── Waiting ──────────────────────────────────────────────────────────────────
  if (sessionStatus === "waiting") {
    return (
      <WaitingRoom
        players={players}
        nickname={nickname}
        avatar={avatar}
        isConnected={isConnected}
      />
    );
  }

  // ── Finished ─────────────────────────────────────────────────────────────────
  if (isFinished) {
    const myRank = finalLeaderboard.findIndex((e) => e.nickname === nickname) + 1;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="text-5xl mb-3">{avatar}</div>
            <h2 className="text-2xl font-extrabold text-[#333333]">
              {myRank === 1
                ? "👑 You won!"
                : myRank <= 3
                ? "🎉 Great job!"
                : "Quiz Complete!"}
            </h2>
            {myRank > 0 && (
              <p className="text-gray-500 mt-1 text-sm">
                You finished <strong>#{myRank}</strong> out of{" "}
                {finalLeaderboard.length} players
              </p>
            )}
          </div>
          <Leaderboard entries={finalLeaderboard} title="Final Leaderboard 🏆" showAll />
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl bg-[#E8F5BD] text-[#333333] font-bold uppercase tracking-widest text-sm hover:bg-[#C7EABB] transition-all cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Active question ──────────────────────────────────────────────────────────
  const timerPercent = (timeLeft / 20) * 100;
  const timerColor =
    timeLeft > 10 ? "bg-green-500" : timeLeft > 5 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl">{avatar}</span>
          <span className="font-bold text-[#333333] text-sm">{nickname}</span>
          {/* FIX: Show connection status so players know if they're desynced */}
          {!isConnected && (
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
              Reconnecting…
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/*
        FIX: Layout redesign — leaderboard moved to TOP-LEFT as required.
        Previously it was a sidebar that disappeared when empty. Now it's always
        visible in the left column once at least one answer is submitted.
      */}
      <div className="flex gap-4 items-start max-w-5xl mx-auto">

        {/* LEFT: Leaderboard (sticky) */}
        {leaderboard.length > 0 && (
          <div className="w-52 shrink-0 sticky top-4">
            <Leaderboard entries={leaderboard} title="Live Standings" />
          </div>
        )}

        {/* RIGHT: Question column */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Timer bar */}
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
            <div
              className={`h-full ${timerColor} transition-all duration-200 rounded-full`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>

          <div className="text-center">
            <span
              className={`text-3xl font-black tabular-nums ${
                timeLeft <= 5 ? "text-red-500" : "text-[#333333]"
              }`}
            >
              {timeLeft}
            </span>
          </div>

          {/* Question card */}
          {currentQuestion && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#333333] leading-relaxed mb-6">
                {currentQuestion.question.question}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.question.options?.map((option: string, i: number) => {
                  let optionStyle =
                    "bg-white border-gray-200 hover:border-green-300 cursor-pointer";

                  if (answerResult) {
                    if (option === answerResult.correctAnswer) {
                      optionStyle = "bg-green-50 border-green-400";
                    } else if (hasAnsweredCurrent && option !== answerResult.correctAnswer) {
                      optionStyle = "bg-red-50 border-red-200 opacity-60";
                    }
                  } else if (hasAnsweredCurrent) {
                    optionStyle =
                      "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed";
                  }

                  return (
                    <button
                      key={i}
                      disabled={hasAnsweredCurrent || timeLeft === 0}
                      onClick={() => submitAnswer(option)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 font-semibold text-sm text-gray-700 ${optionStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Answer feedback */}
              {answerResult && (
                <div
                  className={`mt-4 p-4 rounded-xl text-center font-bold ${
                    answerResult.isCorrect
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {answerResult.isCorrect ? (
                    <>✅ Correct! +{answerResult.points.toLocaleString()} pts</>
                  ) : (
                    <>
                      ❌ Wrong! The answer was:{" "}
                      <span className="underline">{answerResult.correctAnswer}</span>
                    </>
                  )}
                </div>
              )}

              {/* Timed out without answering */}
              {!hasAnsweredCurrent && timeLeft === 0 && !answerResult && (
                <div className="mt-4 p-4 rounded-xl text-center font-bold bg-orange-50 text-orange-600 border border-orange-200">
                  ⏰ Time&apos;s up!
                </div>
              )}

              {/* Next — only shows after answering, only on non-last questions */}
              {hasAnsweredCurrent && !isLastQuestion && (
                <button
                  onClick={handleNext}
                  className="mt-4 w-full py-3 rounded-xl bg-[#333333] text-white font-bold text-sm uppercase tracking-widest hover:bg-black transition-all cursor-pointer"
                >
                  Next →
                </button>
              )}

              {/* Last question answered */}
              {hasAnsweredCurrent && isLastQuestion && (
                <div className="mt-4 p-4 rounded-xl text-center font-bold bg-green-50 text-green-700 border border-green-200">
                  ✅ All done! Waiting for final results…
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}