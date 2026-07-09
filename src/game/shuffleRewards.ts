import type { GameMode } from "@src/game/types";

export const BASE_SHUFFLE_ALLOWANCE = 1;
export const BASE_HINT_ALLOWANCE = 1;
export const TIMED_MODE_SECONDS = 360;
export const HINT_REWARD_THRESHOLD_SECONDS = TIMED_MODE_SECONDS * 0.2;
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

export type RewardAllowanceInput = {
  previousGame: PreviousGameResult | null;
  rollDie?: () => number;
};

export type RewardAllowances = {
  shuffleAllowance: number;
  shuffleBonus: number;
  shuffleDieRoll: number | null;
  hintAllowance: number;
  hintBonus: number;
  hintDieRoll: number | null;
};

export function createBaseRewardAllowances(): RewardAllowances {
  return {
    shuffleAllowance: BASE_SHUFFLE_ALLOWANCE,
    shuffleBonus: 0,
    shuffleDieRoll: null,
    hintAllowance: BASE_HINT_ALLOWANCE,
    hintBonus: 0,
    hintDieRoll: null
  };
}

export function calculateRewardAllowances({
  previousGame,
  rollDie = rollSixSidedDie
}: RewardAllowanceInput): RewardAllowances {
  const reward = createBaseRewardAllowances();

  if (!previousGame || previousGame.mode !== "timed" || !previousGame.completed) {
    return reward;
  }

  if (previousGame.remainingSeconds >= SHUFFLE_REWARD_THRESHOLD_SECONDS) {
    const shuffleDieRoll = clampDieRoll(rollDie());
    reward.shuffleBonus = shuffleDieRoll;
    reward.shuffleDieRoll = shuffleDieRoll;
    reward.shuffleAllowance += shuffleDieRoll;
  }

  if (previousGame.remainingSeconds >= HINT_REWARD_THRESHOLD_SECONDS) {
    const hintDieRoll = clampDieRoll(rollDie());
    reward.hintBonus = hintDieRoll;
    reward.hintDieRoll = hintDieRoll;
    reward.hintAllowance += hintDieRoll;
  }

  return reward;
}

function rollSixSidedDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function clampDieRoll(value: number): number {
  return Math.min(6, Math.max(1, Math.floor(value)));
}
