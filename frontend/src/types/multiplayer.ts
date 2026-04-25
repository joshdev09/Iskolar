// ─── Core Domain Types ─────────────────────────────────────────────────────────

export type SessionStatus = "waiting" | "playing" | "finished";

export type QuizDifficulty = "Easy" | "Medium" | "Hard";

export interface QuizItem {
  question: string;
  options: string[];
  answer: string;
}

export interface Player {
  id: string;
  nickname: string;
  score: number;
  avatar: string;
  lastAnswerTime?: number;
  lastAnswerCorrect?: boolean;
  answeredCurrent?: boolean;
}

export interface QuizSession {
  sessionId: string;
  joinCode: string;
  hostId: string;
  quiz: QuizItem[];
  players: Player[];
  status: SessionStatus;
  currentIndex: number;
  questionStartedAt?: number;
}

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  avatar: string;
  delta: number;
  rank: number;
}

// ─── Socket Event Payloads ─────────────────────────────────────────────────────

export interface JoinSessionPayload {
  sessionId: string;
  nickname: string;
  avatar: string;
}

export interface StartGamePayload {
  sessionId: string;
}

export interface NextQuestionPayload {
  sessionId: string;
}

export interface SubmitAnswerPayload {
  sessionId: string;
  answer: string;
  playerId: string;
}

export interface QuestionStartedData {
  question: QuizItem;
  index: number;
  total: number;
  startedAt: number;
}

export interface AnswerResultData {
  isCorrect: boolean;
  points: number;
  correctAnswer: string;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface CreateSessionResponse {
  sessionId: string;
  joinCode: string;
}

export interface SessionResponse {
  sessionId: string;
  joinCode: string;
  status: SessionStatus;
  players: Player[];
  quiz: QuizItem[];
  currentIndex: number;
}
