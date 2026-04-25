import { v4 as uuid } from "uuid";
import type { QuizSession, QuizItem, Player } from "../frontend/src/types/multiplayer";

// ─── In-Memory Store ───────────────────────────────────────────────────────────

const sessions = new Map<string, QuizSession>();
const codeIndex = new Map<string, string>(); // joinCode → sessionId

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeJoinCode(): string {
  let code: string;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (codeIndex.has(code));
  return code;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function createSession(hostId: string, quiz: QuizItem[]): QuizSession {
  const sessionId = uuid();
  const joinCode = makeJoinCode();

  const session: QuizSession = {
    sessionId,
    joinCode,
    hostId,
    quiz,
    players: [],
    status: "waiting",
    currentIndex: 0,
  };

  sessions.set(sessionId, session);
  codeIndex.set(joinCode, sessionId);
  return session;
}

export function getSession(sessionId: string): QuizSession | null {
  return sessions.get(sessionId) ?? null;
}

export function getSessionByCode(joinCode: string): QuizSession | null {
  const sessionId = codeIndex.get(joinCode.toUpperCase());
  if (!sessionId) return null;
  return sessions.get(sessionId) ?? null;
}

export function addPlayer(
  sessionId: string,
  player: { id: string; nickname: string; avatar: string }
): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  // Prevent duplicate socket IDs (reconnect scenario)
  const existing = session.players.find((p) => p.id === player.id);
  if (existing) return session;

  // Allow rejoin by nickname — restore previous score
  const byNickname = session.players.find(
    (p) => p.nickname.toLowerCase() === player.nickname.toLowerCase()
  );
  if (byNickname) {
    byNickname.id = player.id; // update socket id
    return session;
  }

  const newPlayer: Player = {
    id: player.id,
    nickname: player.nickname,
    avatar: player.avatar,
    score: 0,
    answeredCurrent: false,
  };
  session.players.push(newPlayer);
  return session;
}

export function removePlayer(sessionId: string, playerId: string): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  session.players = session.players.filter((p) => p.id !== playerId);
  return session;
}

export function updateSession(
  sessionId: string,
  patch: Partial<QuizSession>
): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  Object.assign(session, patch);
  return session;
}

export function applyAnswer(
  sessionId: string,
  playerId: string,
  points: number,
  isCorrect: boolean
): QuizSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const player = session.players.find((p) => p.id === playerId);
  if (player && !player.answeredCurrent) {
    player.score += points;
    player.lastAnswerCorrect = isCorrect;
    player.answeredCurrent = true;
  }
  return session;
}

export function resetAnsweredFlags(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.players.forEach((p) => {
    p.answeredCurrent = false;
    p.lastAnswerCorrect = undefined;
  });
}

export function deleteSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (session) codeIndex.delete(session.joinCode);
  sessions.delete(sessionId);
}

export function getSortedLeaderboard(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) return [];
  return [...session.players].sort((a, b) => b.score - a.score);
}
