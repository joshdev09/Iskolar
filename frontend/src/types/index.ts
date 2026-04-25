// ─── Notes Organizer ─────────────────────────────────────────────────────────

export interface OrganizedNotes {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}

// ─── Quiz Generator ───────────────────────────────────────────────────────────

export type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizSettings {
  topicPrompt: string;
  numItems: number;
  difficulty: QuizDifficulty;
  file: File | null;
}
