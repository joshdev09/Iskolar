import type { OrganizedNotes, QuizQuestion, QuizSettings } from '@/types';

const BASE_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api`;

// ─── Notes Organizer API ──────────────────────────────────────────────────────

export async function organizeNotes(files: File[]): Promise<OrganizedNotes> {
  const formData = new FormData();
  files.forEach((file) => formData.append('documents', file));

  const response = await fetch(`${BASE_URL}/organize-notes`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to process the file.');
  }

  return response.json() as Promise<OrganizedNotes>;
}

// ─── Quiz Generator API ───────────────────────────────────────────────────────

export async function generateQuiz(settings: QuizSettings): Promise<QuizQuestion[]> {
  const { topicPrompt, numItems, difficulty, file } = settings;

  const formData = new FormData();
  formData.append('topicPrompt', topicPrompt);
  formData.append('numItems', numItems.toString());
  formData.append('difficulty', difficulty);
  if (file) formData.append('file', file);

  const response = await fetch(`${BASE_URL}/generate-quiz`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Something went wrong on the server.');
  }

  const quiz: QuizQuestion[] = await response.json();

  if (quiz.length === 0) {
    throw new Error('The content was insufficient to create a quiz. Try adding more text!');
  }

  return quiz;
}
