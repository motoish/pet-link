import type { PreviousGameResult, RewardAllowances } from "../game/shuffleRewards";
import type { GameMode } from "../game/types";
import { isLanguage, type Language } from "../i18n/translations";

const LAST_MODE_KEY = "pet-link:last-mode";
const LANGUAGE_KEY = "pet-link:language";
const BEST_RELAXED_KEY = "pet-link:best-relaxed-time";
const BEST_TIMED_KEY = "pet-link:best-timed-score";
const PREVIOUS_GAME_KEY = "pet-link:previous-game";
const PENDING_REWARD_KEY = "pet-link:pending-reward";

export function loadLastMode(): GameMode {
  const value = localStorage.getItem(LAST_MODE_KEY);
  return value === "timed" || value === "relaxed" ? value : "relaxed";
}

export function saveLastMode(mode: GameMode) {
  localStorage.setItem(LAST_MODE_KEY, mode);
}

export function loadLanguage(): Language {
  const value = localStorage.getItem(LANGUAGE_KEY);
  return value && isLanguage(value) ? value : "zh-CN";
}

export function saveLanguage(language: Language) {
  localStorage.setItem(LANGUAGE_KEY, language);
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

export function consumePendingReward(): RewardAllowances | null {
  const value = localStorage.getItem(PENDING_REWARD_KEY);
  if (!value) {
    return null;
  }

  localStorage.removeItem(PENDING_REWARD_KEY);

  try {
    const parsed = JSON.parse(value) as RewardAllowances;
    if (
      typeof parsed.shuffleAllowance === "number" &&
      typeof parsed.hintAllowance === "number" &&
      typeof parsed.shuffleBonus === "number" &&
      typeof parsed.hintBonus === "number"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function savePendingReward(reward: RewardAllowances) {
  localStorage.setItem(PENDING_REWARD_KEY, JSON.stringify(reward));
}

function loadNumber(key: string): number | null {
  const value = localStorage.getItem(key);
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
