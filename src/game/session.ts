import type { GameMode } from "@src/game/types";

export type SessionPhase = "menu" | "game";

export type SessionState = {
  phase: SessionPhase;
  mode: GameMode;
};

export function createMenuSession(mode: GameMode): SessionState {
  return { phase: "menu", mode };
}

export function startSession(_session: SessionState, mode: GameMode): SessionState {
  return { phase: "game", mode };
}

export function exitSession(session: SessionState): SessionState {
  return { phase: "menu", mode: session.mode };
}
