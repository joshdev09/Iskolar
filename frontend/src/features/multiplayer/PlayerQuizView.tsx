import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useMultiplayerQuiz } from "@/hooks/useMultiplayerQuiz";
import { WaitingRoom } from "./WaitingRoom";
import { Leaderboard } from "./Leaderboard";

export function PlayerQuizView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { nickname, avatar } = (location.state as any) ?? {};

  // Guard: if no nickname, bounce back to join
  if (!nickname || !sessionId) {
    navigate(`/join/${sessionId ?? ""}`);
    return null;
  }

  const {
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

  // ── Active question ───────────────────────────────────────────────────────────
  const timerPercent = (timeLeft / 20) * 100;
  const timerColor =
    timeLeft > 10 ? "bg-green-500" : timeLeft > 5 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4">
        {/* Header strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{avatar}</span>
            <span className="font-bold text-[#333333] text-sm">{nickname}</span>
          </div>
          {currentQuestion && (
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {currentQuestion.index + 1} / {currentQuestion.total}
            </span>
          )}
        </div>

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

            {/* Answer options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.question.options?.map((option: string, i: number) => {
                let optionStyle =
                  "bg-white border-gray-200 hover:border-green-300 cursor-pointer";

                if (answerResult) {
                  if (option === answerResult.correctAnswer) {
                    optionStyle = "bg-green-50 border-green-400";
                  } else if (hasAnswered && option !== answerResult.correctAnswer) {
                    optionStyle = "bg-red-50 border-red-200 opacity-60";
                  }
                } else if (hasAnswered) {
                  optionStyle = "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed";
                }

                return (
                  <button
                    key={i}
                    disabled={hasAnswered || timeLeft === 0}
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
                className={`mt-4 p-4 rounded-xl text-center font-bold transition-all ${
                  answerResult.isCorrect
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {answerResult.isCorrect ? (
                  <>✅ Correct! +{answerResult.points.toLocaleString()} pts</>
                ) : (
                  <>❌ Wrong! The answer was: {answerResult.correctAnswer}</>
                )}
              </div>
            )}

            {/* Timed out */}
            {!hasAnswered && timeLeft === 0 && !answerResult && (
              <div className="mt-4 p-4 rounded-xl text-center font-bold bg-orange-50 text-orange-600 border border-orange-200">
                ⏰ Time's up!
              </div>
            )}
          </div>
        )}

        {/* Live leaderboard (compact) */}
        {leaderboard.length > 0 && answerResult && (
          <Leaderboard entries={leaderboard} title="Current Standings" />
        )}
      </div>
    </div>
  );
}
