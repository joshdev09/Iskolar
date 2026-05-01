import { useSessionHost } from "@/hooks/useSessionHost";
import { Leaderboard } from "./Leaderboard";

interface HostViewProps {
  sessionId: string;
  joinCode: string;
  quizLength: number;
}

export function HostView({ sessionId, joinCode, quizLength }: HostViewProps) {
  const {
    players,
    leaderboard,
    currentQuestion,
    currentIndex,      // ← new field — must destructure or TS may bail silently
    totalQuestions,    // ← new field
    isPlaying,
    isFinished,
    finalLeaderboard,
    startGame,
    nextQuestion,
    endSession,
  } = useSessionHost({ sessionId });

  const shareUrl = `${window.location.origin}/join/${sessionId}`;
  const copyLink = () => navigator.clipboard.writeText(shareUrl);
  const copyCode = () => navigator.clipboard.writeText(joinCode);

  // ── Waiting room ────────────────────────────────────────────────────────────
  if (!isPlaying && !isFinished) {
    return (
      // FIX: removed mx-auto centering that was collapsing in some layout containers.
      // Added min-h to guarantee the content is visible even in flex parents.
      <div className="w-full max-w-2xl mx-auto p-6 space-y-6 min-h-400px">
        <div>
          <h1 className="text-3xl font-extrabold text-[#333333] tracking-tight">
            Quiz Ready!
          </h1>
          <p className="text-gray-500 text-sm mt-1">Share the code below to invite players.</p>
        </div>

        {/* Join code card */}
        <div className="bg-[#E8F5BD] rounded-2xl p-8 text-center border border-green-200">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">
            Join Code
          </p>
          <p
            className="text-6xl font-black text-[#333333] tracking-[0.15em] cursor-pointer select-all"
            onClick={copyCode}
            title="Click to copy"
          >
            {joinCode}
          </p>
          <p className="text-xs text-gray-400 mt-3 break-all">{shareUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={copyLink}
            className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-sm font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          >
            Copy Link
          </button>
          <button
            onClick={startGame}
            disabled={players.length === 0}
            className="flex-1 py-3 rounded-xl bg-[#333333] text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            {players.length === 0 ? "Waiting for players…" : "Start Game"}
          </button>
        </div>

        {/* Player list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-[#333333] uppercase text-xs tracking-widest">
              Players Joined
            </h3>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              {players.length} joined
            </span>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              <p className="text-4xl mb-3">👀</p>
              <p className="text-sm font-medium text-gray-400">Waiting for players…</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
                >
                  <span className="text-xl">{p.avatar}</span>
                  <span className="text-sm font-bold text-[#333333] truncate">
                    {p.nickname}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Active game (host view — no answer buttons, just controls + leaderboard) ─
  if (isPlaying && !isFinished) {
    // Use live totalQuestions if available, fall back to quizLength prop
    const total = totalQuestions || quizLength;
    const qIndex = currentQuestion ? currentQuestion.index : currentIndex;
    const isLastQ = qIndex + 1 >= total;

    return (
      <div className="w-full max-w-2xl mx-auto p-6 space-y-6 min-h-400px">
        {currentQuestion && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex justify-between items-center mb-4">
              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-green-100">
                Question {qIndex + 1} / {total}
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Host view
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#333333] leading-relaxed">
              {currentQuestion.question.question}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {currentQuestion.question.options?.map((opt: string, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm font-semibold text-gray-600"
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={nextQuestion}
            className="flex-1 py-4 rounded-xl bg-[#333333] text-white font-bold uppercase tracking-widest text-sm hover:bg-black transition-all cursor-pointer"
          >
            {isLastQ ? "End Quiz" : "Next Question →"}
          </button>
          <button
            onClick={endSession}
            className="px-6 py-4 rounded-xl bg-red-50 text-red-500 font-bold uppercase tracking-widest text-xs hover:bg-red-100 transition-all cursor-pointer"
          >
            End
          </button>
        </div>

        {leaderboard.length > 0 && (
          <Leaderboard entries={leaderboard} title="Live Standings" />
        )}
      </div>
    );
  }

  // ── Finished ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto p-6 min-h-400px">
      <Leaderboard entries={finalLeaderboard} title="Final Results 🏆" showAll />
    </div>
  );
}