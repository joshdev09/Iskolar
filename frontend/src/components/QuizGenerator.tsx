import { useState } from "react";
import { useQuizGenerator } from "@/hooks/useQuizGenerator";
import type { QuizDifficulty } from "@/types";
import { HostView } from "@/features/multiplayer/HostView";

// ─── Sub-views ────────────────────────────────────────────────────────────────

function QuizSettings({ settings, isGenerating, onUpdate, onGenerate }: {
  settings: ReturnType<typeof useQuizGenerator>["settings"];
  isGenerating: boolean;
  onUpdate: ReturnType<typeof useQuizGenerator>["updateSettings"];
  onGenerate: () => void;
}) {
  const canGenerate = !isGenerating && (!!settings.topicPrompt || !!settings.file);

  return (
    <div className="bg-white mt-25 p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto">
      <div className="flex gap-2 items-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <h3 className="text-xl font-bold text-[#333333]">Quiz Settings</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">
            Topic or Notes
          </label>
          <textarea
            placeholder="Paste notes here..."
            value={settings.topicPrompt}
            onChange={(e) => onUpdate({ topicPrompt: e.target.value })}
            className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#E8F5BD] outline-none transition-all resize-none text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">
              Items
            </label>
            <input
              type="number"
              value={settings.numItems}
              min={1}
              onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                onUpdate({ numItems: isNaN(val) ? 1 : Math.max(1, val) });
              }}
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-medium focus:ring-2 focus:ring-[#E8F5BD]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">
              Difficulty
            </label>
            <div className="relative">
              <select
                value={settings.difficulty}
                onChange={(e) => onUpdate({ difficulty: e.target.value as QuizDifficulty })}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg outline-none appearance-none cursor-pointer text-sm font-medium pr-10 focus:ring-2 focus:ring-[#E8F5BD]"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">
            Upload File
          </label>
          <input
            type="file"
            onChange={(e) => onUpdate({ file: e.target.files?.[0] ?? null })}
            className="block w-full text-xs text-gray-400 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:bg-[#E8F5BD] file:text-green-700 file:font-semibold cursor-pointer"
          />
        </div>

        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className="w-full bg-[#E8F5BD] hover:bg-[#C7EABB] text-[#333333] font-bold py-4 rounded-xl transition-all disabled:opacity-50 text-base uppercase tracking-widest cursor-pointer disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating..." : "Generate Quiz"}
        </button>
      </div>
    </div>
  );
}

function QuizGeneratingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-24 mt-40 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-gray-100 rounded-full mb-6" />
      <div className="h-4 w-64 bg-gray-100 rounded mb-4" />
      <div className="h-4 w-48 bg-gray-100 rounded opacity-50" />
    </div>
  );
}

function ShareBanner({ onMultiplayer, onSinglePlayer, isCreatingSession }: {
  onMultiplayer: () => void;
  onSinglePlayer: () => void;
  isCreatingSession: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-30 max-w-2xl mx-auto">
      <h3 className="text-lg font-extrabold text-[#333333] mb-1">Quiz Ready! 🎉</h3>
      <p className="text-sm text-gray-400 mb-6">How would you like to play?</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onSinglePlayer}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-gray-200 transition-all cursor-pointer"
        >
          <span className="text-3xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </span>
          <span className="font-bold text-[#333333] text-sm">Solo Play</span>
          <span className="text-xs text-gray-400">Practice by yourself</span>
        </button>
        <button
          onClick={onMultiplayer}
          disabled={isCreatingSession}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-green-200 bg-[#E8F5BD] hover:bg-[#C7EABB] transition-all cursor-pointer disabled:opacity-60"
        >
          <span className="text-3xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </span>
          <span className="font-bold text-[#333333] text-sm">
            {isCreatingSession ? "Creating..." : "Multiplayer"}
          </span>
          <span className="text-xs text-gray-500">Compete with others</span>
        </button>
      </div>
    </div>
  );
}

function ActiveQuiz({ quiz, currentIndex, userAnswers, progressPercent, onSelectOption, onNext, onPrev, onSubmit }: any) {
  const currentQuestion = quiz[currentIndex];
  const selectedAnswer = userAnswers[currentIndex];
  const isLastQuestion = currentIndex === quiz.length - 1;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-500px flex flex-col justify-between">
      <div>
        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">
            <span>Current Progress</span>
            <span>{currentIndex + 1} / {quiz.length}</span>
          </div>
          <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100">
            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-100">
          Question {currentIndex + 1}
        </span>
        <h2 className="text-xl font-bold text-[#333333] leading-relaxed mt-6 mb-7">
          {currentQuestion?.question ?? "Loading question..."}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion?.options?.map((option: string, i: number) => {
            const isSelected = selectedAnswer === option;
            return (
              <label key={i} className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? "bg-green-50 border-green-400 shadow-sm" : "bg-white border-gray-100 hover:border-green-100"}`}>
                <input type="radio" name="quiz-option" checked={isSelected} onChange={() => onSelectOption(option)} className="hidden" />
                <div className={`w-auto h-auto rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${isSelected ? "border-green-500 bg-green-500 text-white" : "border-gray-200"}`}>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700 font-semibold">{option}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div className="mt-12 flex items-center justify-between">
        <button disabled={currentIndex === 0} onClick={onPrev} className="px-8 py-3 rounded-xl font-bold text-sm text-gray-400 hover:bg-gray-50 disabled:opacity-0 transition-all cursor-pointer">
          PREVIOUS
        </button>
        {isLastQuestion ? (
          <button onClick={onSubmit} className="px-12 py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 active:scale-95 text-sm uppercase tracking-widest cursor-pointer">
            Finish Quiz
          </button>
        ) : (
          <button onClick={onNext} className="px-12 py-4 bg-[#333333] text-white rounded-xl font-bold hover:bg-black transition-all transform hover:scale-105 active:scale-95 text-sm uppercase tracking-widest cursor-pointer">
            Next
          </button>
        )}
      </div>
    </div>
  );
}

function QuizResults({ score, total, onRetake, onExit }: any) {
  const isPerfect = score === total;
  const isZero = score === 0;
  const headline = isPerfect ? "👑 Absolute Legend!" : isZero ? "🌑 Ouch... Try Again!" : "Quiz Complete!";

  return (
    <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
      <h2 className="text-3xl font-extrabold text-[#333333]">{headline}</h2>
      <div className="my-10">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Final Score</p>
        <p className="text-7xl font-black text-green-500">{score}{" "}<span className="text-2xl text-gray-300">/ {total}</span></p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={onRetake} className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all uppercase text-xs cursor-pointer">Retake</button>
        <button onClick={onExit} className="px-12 py-4 bg-[#F53838] text-white rounded-xl font-bold hover:bg-[#F20D0D] shadow-md transition-all uppercase text-xs cursor-pointer">Exit</button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function QuizGenerator() {
  const {
    quiz, userAnswers, currentIndex, isFinished, isGenerating, score,
    settings, updateSettings, handleGenerate, handleSelectOption,
    handleNext, handlePrev, handleSubmit, handleRetake, handleReset, progressPercent,
  } = useQuizGenerator();

  const [mode, setMode] = useState<"solo" | "multiplayer" | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  async function handleStartMultiplayer() {
    if (!quiz) return;
    setIsCreatingSession(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: `host_${Date.now()}`, quiz }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setJoinCode(data.joinCode);
      setMode("multiplayer");
    } catch (err) {
      console.error("Failed to create session", err);
    } finally {
      setIsCreatingSession(false);
    }
  }

  function handleReset2() {
    handleReset();
    setMode(null);
    setSessionId(null);
    setJoinCode(null);
  }

  const showModeChooser = quiz && !isFinished && !isGenerating && mode === null;

  return (
    <div className="w-full">
      {/* Cancel button */}
      {quiz && !isFinished && mode !== null && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleReset2}
            className="px-4 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors uppercase tracking-widest cursor-pointer"
          >
            Cancel Quiz
          </button>
        </div>
      )}

      {isGenerating && <QuizGeneratingSkeleton />}

      {!quiz && !isGenerating && (
        <QuizSettings
          settings={settings}
          isGenerating={isGenerating}
          onUpdate={updateSettings}
          onGenerate={handleGenerate}
        />
      )}

      {showModeChooser && (
        <ShareBanner
          onMultiplayer={handleStartMultiplayer}
          onSinglePlayer={() => setMode("solo")}
          isCreatingSession={isCreatingSession}
        />
      )}

      {mode === "multiplayer" && sessionId && joinCode && quiz && (
        <HostView sessionId={sessionId} joinCode={joinCode} quizLength={quiz.length} />
      )}

      {mode === "solo" && quiz && !isFinished && (
        <ActiveQuiz
          quiz={quiz}
          currentIndex={currentIndex}
          userAnswers={userAnswers}
          progressPercent={progressPercent}
          onSelectOption={handleSelectOption}
          onNext={handleNext}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
        />
      )}

      {mode === "solo" && isFinished && quiz && (
        <QuizResults
          score={score}
          total={quiz.length}
          onRetake={handleRetake}
          onExit={handleReset2}
        />
      )}
    </div>
  );
}