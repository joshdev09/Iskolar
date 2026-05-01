import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionPlayer {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  correctCount: number;
}

export interface Session {
  sessionId: string;
  joinCode: string;
  hostId: string;
  quiz: any[];
  players: SessionPlayer[];
  status: "waiting" | "playing" | "finished";
  currentIndex: number;
  questionStartedAt: number | null;
  answeredKeys: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateJoinCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

function generateSessionId(): string {
  return randomBytes(8).toString("hex");
}

function rowToSession(row: any): Session {
  return {
    sessionId: row.id,
    joinCode: row.join_code,
    hostId: row.host_id,
    quiz: row.quiz,
    players: row.players ?? [],
    status: row.status,
    currentIndex: row.current_index,
    questionStartedAt: row.question_started_at ?? null,
    answeredKeys: row.answered_keys ?? [],
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createSession(hostId: string, quiz: any[]): Promise<Session> {
  const id = generateSessionId();
  const joinCode = generateJoinCode();

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      id,
      join_code: joinCode,
      host_id: hostId,
      quiz,
      players: [],
      status: "waiting",
      current_index: 0,
      question_started_at: null,
      answered_keys: [],
    })
    .select()
    .single();

  if (error) throw new Error(`createSession failed: ${error.message}`);
  return rowToSession(data);
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !data) return null;
  return rowToSession(data);
}

export async function getSessionByCode(joinCode: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("join_code", joinCode.toUpperCase())
    .single();

  if (error || !data) return null;
  return rowToSession(data);
}

export async function updateSession(
  sessionId: string,
  patch: {
    status?: Session["status"];
    currentIndex?: number;
    questionStartedAt?: number | null;
  }
): Promise<void> {
  const dbPatch: any = {};
  if (patch.status !== undefined)            dbPatch.status = patch.status;
  if (patch.currentIndex !== undefined)      dbPatch.current_index = patch.currentIndex;
  if (patch.questionStartedAt !== undefined) dbPatch.question_started_at = patch.questionStartedAt;

  const { error } = await supabase.from("sessions").update(dbPatch).eq("id", sessionId);
  if (error) throw new Error(`updateSession failed: ${error.message}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await supabase.from("sessions").delete().eq("id", sessionId);
}

// ─── Players ──────────────────────────────────────────────────────────────────

export async function addPlayer(
  sessionId: string,
  player: { id: string; nickname: string; avatar: string }
): Promise<Session | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  const newPlayer: SessionPlayer = { ...player, score: 0, correctCount: 0 };
  const updatedPlayers = [...session.players, newPlayer];

  const { error } = await supabase
    .from("sessions")
    .update({ players: updatedPlayers })
    .eq("id", sessionId);

  if (error) return null;
  session.players = updatedPlayers;
  return session;
}

export async function updatePlayerId(
  sessionId: string,
  nickname: string,
  newSocketId: string
): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) return;

  const updatedPlayers = session.players.map((p) =>
    p.nickname === nickname ? { ...p, id: newSocketId } : p
  );

  await supabase.from("sessions").update({ players: updatedPlayers }).eq("id", sessionId);
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export async function hasPlayerAnswered(
  sessionId: string,
  playerId: string,
  questionIndex: number
): Promise<boolean> {
  const session = await getSession(sessionId);
  if (!session) return false;
  return session.answeredKeys.includes(`${playerId}:${questionIndex}`);
}

export async function applyAnswer(
  sessionId: string,
  playerId: string,
  points: number,
  isCorrect: boolean,
  questionIndex: number
): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) return;

  const key = `${playerId}:${questionIndex}`;
  if (session.answeredKeys.includes(key)) return;

  const updatedKeys = [...session.answeredKeys, key];
  const updatedPlayers = session.players.map((p) =>
    p.id !== playerId ? p : {
      ...p,
      score: p.score + points,
      correctCount: p.correctCount + (isCorrect ? 1 : 0),
    }
  );

  const { error } = await supabase
    .from("sessions")
    .update({ players: updatedPlayers, answered_keys: updatedKeys })
    .eq("id", sessionId);

  if (error) throw new Error(`applyAnswer failed: ${error.message}`);
}

export async function allPlayersAnswered(
  sessionId: string,
  questionIndex: number
): Promise<boolean> {
  const session = await getSession(sessionId);
  if (!session) return false;
  const active = session.players.filter((p) => p.nickname !== "__host__");
  return active.every((p) => session.answeredKeys.includes(`${p.id}:${questionIndex}`));
}

export async function getSortedLeaderboard(sessionId: string): Promise<SessionPlayer[]> {
  const session = await getSession(sessionId);
  if (!session) return [];
  return [...session.players].sort((a, b) => b.score - a.score);
}

export function resetAnsweredFlags(_sessionId: string): void {}