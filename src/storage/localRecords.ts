import type { GameMode } from "../game/types";
import type { PreviousGameResult } from "../game/shuffleRewards";

const LAST_MODE_KEY = "pet-link:last-mode";
const BEST_RELAXED_KEY = "pet-link:best-relaxed-time";
const BEST_TIMED_KEY = "pet-link:best-timed-score";
const PREVIOUS_GAME_KEY = "pet-link:previous-game";

export function loadLastMode(): GameMode {
  const value = localStorage.getItem(LAST_MODE_KEY);
  return value === "timed" || value === "relaxed" ? value : "relaxed";
}

export function saveLastMode(mode: GameMode) {
  localStorage.setItem(LAST_MODE_KEY, mode);
}

export function loadBestRelaxedTime(): number | null {
  return loadNumber(BEST_RELAXED_KEY);
}

export function saveBestRelaxedTime(seconds: number) {
  const current = loadBestRelaxedTime();
  if (current === null || seconds < current) {
    localStorage.setItem(BEST_RELAXED_KEY, String(seconds));
  }
}

export function loadBestTimedScore(): number | null {
  return loadNumber(BEST_TIMED_KEY);
}

export function saveBestTimedScore(score: number) {
  const current = loadBestTimedScore();
  if (current === null || score > current) {
    localStorage.setItem(BEST_TIMED_KEY, String(score));
  }
}

export function loadPreviousGameResult(): PreviousGameResult | null {
  const value = localStorage.getItem(PREVIOUS_GAME_KEY);
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as PreviousGameResult;
    if (parsed.mode === "timed" && typeof parsed.remainingSeconds === "number") {
      return parsed;
    }
    if (parsed.mode === "relaxed") {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function savePreviousGameResult(result: PreviousGameResult) {
  localStorage.setItem(PREVIOUS_GAME_KEY, JSON.stringify(result));
}

function loadNumber(key: string): number | null {
  const value = localStorage.getItem(key);
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
