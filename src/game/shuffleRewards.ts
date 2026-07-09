import type { GameMode } from "./types";

export const BASE_SHUFFLE_ALLOWANCE = 1;
export const TIMED_MODE_SECONDS = 360;
export const SHUFFLE_REWARD_THRESHOLD_SECONDS = TIMED_MODE_SECONDS * 0.3;

export type PreviousGameResult =
  | {
      mode: "timed";
      completed: boolean;
      remainingSeconds: number;
    }
  | {
      mode: Exclude<GameMode, "timed">;
      completed: boolean;
      remainingSeconds: null;
    };

export type ShuffleRewardInput = {
  previousGame: PreviousGameResult | null;
  rollDie?: () => number;
};

export type ShuffleRewardResult = {
  allowance: number;
  bonus: number;
  dieRoll: number | null;
};

export function calculateNextShuffleAllowance({
  previousGame,
  rollDie = rollSixSidedDie
}: ShuffleRewardInput): ShuffleRewardResult {
  if (
    !previousGame ||
    previousGame.mode !== "timed" ||
    !previousGame.completed ||
    previousGame.remainingSeconds < SHUFFLE_REWARD_THRESHOLD_SECONDS
  ) {
    return {
      allowance: BASE_SHUFFLE_ALLOWANCE,
      bonus: 0,
      dieRoll: null
    };
  }

  const dieRoll = clampDieRoll(rollDie());
  return {
    allowance: BASE_SHUFFLE_ALLOWANCE + dieRoll,
    bonus: dieRoll,
    dieRoll
  };
}

function rollSixSidedDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function clampDieRoll(value: number): number {
  return Math.min(6, Math.max(1, Math.floor(value)));
}
