import { useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { generateQuiz } from "@/services/api";
import type { QuizQuestion, QuizDifficulty, QuizSettings } from "@/types";

interface UseQuizGeneratorReturn {
  quiz: QuizQuestion[] | null;
  userAnswers: Record<number, string>;
  currentIndex: number;
  isFinished: boolean;
  isGenerating: boolean;
  score: number;
  settings: QuizSettings;
  updateSettings: (patch: Partial<QuizSettings>) => void;
  handleGenerate: () => Promise<void>;
  handleSelectOption: (option: string) => void;
  handleNext: () => void;
  handlePrev: () => void;
  handleSubmit: () => void;
  handleRetake: () => void;
  handleReset: () => void;
  progressPercent: number;
}

const DEFAULT_SETTINGS: QuizSettings = {
  topicPrompt: "",
  numItems: 5,
  difficulty: "Medium" as QuizDifficulty,
  file: null,
};

function fireConfetti(score: number, total: number) {
  const isPerfect = score === total;
  const isZero = score === 0;

  if (isPerfect) {
    const end = Date.now() + 3000;
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 80, origin: { x: 0, y: 0.6 }, colors: ["#E8F5BD", "#4ade80"], startVelocity: 60 });
      confetti({ particleCount: 3, angle: 120, spread: 80, origin: { x: 1, y: 0.6 }, colors: ["#E8F5BD", "#4ade80"], startVelocity: 60 });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  } else if (isZero) {
    confetti({ particleCount: 100, spread: 120, origin: { y: 0, x: 0.5 }, gravity: 2.2, startVelocity: 45, colors: ["#333333", "#666666"], ticks: 120 });
  } else {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, startVelocity: 55, colors: ["#E8F5BD", "#C7EABB", "#4ade80"], ticks: 150 });
  }
}

export function useQuizGenerator(): UseQuizGeneratorReturn {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [score, setScore] = useState(0);
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((patch: Partial<QuizSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleReset = useCallback(() => {
    setQuiz(null);
    setUserAnswers({});
    setIsFinished(false);
    setScore(0);
    setCurrentIndex(0);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!settings.topicPrompt && !settings.file) return;

    setIsGenerating(true);
    try {
      const generated = await generateQuiz(settings);
      if (generated.length === 0) {
        alert("The content was insufficient to create a quiz. Try more text!");
        return;
      }
      setQuiz(generated);
      setCurrentIndex(0);
      setUserAnswers({});
      setIsFinished(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate quiz.";
      alert(`Error: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [settings]);

  const handleSelectOption = useCallback((option: string) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  }, [currentIndex]);

  const handleNext = useCallback(() => setCurrentIndex((i) => i + 1), []);
  const handlePrev = useCallback(() => setCurrentIndex((i) => i - 1), []);

  const handleSubmit = useCallback(() => {
    if (!quiz) return;
    const finalScore = quiz.reduce(
      (acc, q, i) => acc + (userAnswers[i] === q.correctAnswer ? 1 : 0),
      0
    );
    setScore(finalScore);
    setIsFinished(true);
    fireConfetti(finalScore, quiz.length);
  }, [quiz, userAnswers]);

  const handleRetake = useCallback(() => {
    setIsFinished(false);
    setCurrentIndex(0);
    setUserAnswers({});
  }, []);

  const progressPercent = quiz
    ? ((currentIndex + 1) / quiz.length) * 100
    : 0;

  return {
    quiz,
    userAnswers,
    currentIndex,
    isFinished,
    isGenerating,
    score,
    settings,
    updateSettings,
    handleGenerate,
    handleSelectOption,
    handleNext,
    handlePrev,
    handleSubmit,
    handleRetake,
    handleReset,
    progressPercent,
  };
}
