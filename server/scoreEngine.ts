// scoreEngine.ts
// Points formula: base points for a correct answer + time bonus for speed.
// Fast answers get up to BASE_POINTS * 2; slow answers get BASE_POINTS.

const BASE_POINTS     = 500;
const MAX_TIME_BONUS  = 500; // awarded only on instant answers
const QUESTION_WINDOW = 20_000; // ms — must match QUESTION_DURATION_MS on client

/**
 * @param isCorrect     Whether the player answered correctly
 * @param startedAt     Server epoch (ms) when the question started
 * @returns             Points to award (0 for wrong/timeout)
 */
export function calculateScore(isCorrect: boolean, startedAt: number): number {
  if (!isCorrect) return 0;

  const elapsed = Date.now() - startedAt;
  const ratio   = Math.max(0, 1 - elapsed / QUESTION_WINDOW); // 1.0 → 0.0
  const bonus   = Math.round(MAX_TIME_BONUS * ratio);

  return BASE_POINTS + bonus;
}