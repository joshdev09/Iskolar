// ─── Score Engine ──────────────────────────────────────────────────────────────

const BASE_POINTS = 1000;
const MAX_TIME_BONUS = 500;
const TIME_LIMIT_MS = 20_000; // 20 seconds per question

export function calculateScore(
  isCorrect: boolean,
  questionStartedAt: number
): number {
  if (!isCorrect) return 0;
  const elapsed = Date.now() - questionStartedAt;
  const ratio = Math.max(0, 1 - elapsed / TIME_LIMIT_MS);
  const timeBonus = Math.floor(MAX_TIME_BONUS * ratio);
  return BASE_POINTS + timeBonus;
}

export const TIME_LIMIT_SECONDS = TIME_LIMIT_MS / 1000;
