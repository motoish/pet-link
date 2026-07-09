import {
  calculateRewardAllowances,
  createBaseRewardAllowances,
  HINT_REWARD_THRESHOLD_SECONDS,
  SHUFFLE_REWARD_THRESHOLD_SECONDS
} from "@src/game/shuffleRewards";
import { describe, expect, test } from "vitest";

function rolling(...values: number[]) {
  let index = 0;
  return () => values[index++] ?? values[values.length - 1] ?? 1;
}

describe("createBaseRewardAllowances", () => {
  test("starts every game with one shuffle and one hint", () => {
    expect(createBaseRewardAllowances()).toEqual({
      shuffleAllowance: 1,
      shuffleBonus: 0,
      shuffleDieRoll: null,
      hintAllowance: 1,
      hintBonus: 0,
      hintDieRoll: null
    });
  });
});

describe("calculateRewardAllowances", () => {
  test("does not award bonuses without a previous completion", () => {
    const result = calculateRewardAllowances({ previousGame: null, rollDie: rolling(6) });

    expect(result).toEqual(createBaseRewardAllowances());
  });

  test("does not award bonuses for failed timed games", () => {
    const result = calculateRewardAllowances({
      previousGame: { mode: "timed", completed: false, remainingSeconds: 180 },
      rollDie: rolling(6)
    });

    expect(result).toEqual(createBaseRewardAllowances());
  });

  test("does not award bonuses for relaxed games", () => {
    const result = calculateRewardAllowances({
      previousGame: { mode: "relaxed", completed: true, remainingSeconds: null },
      rollDie: rolling(6)
    });

    expect(result).toEqual(createBaseRewardAllowances());
  });

  test("does not award either bonus below the hint threshold", () => {
    const result = calculateRewardAllowances({
      previousGame: {
        mode: "timed",
        completed: true,
        remainingSeconds: HINT_REWARD_THRESHOLD_SECONDS - 1
      },
      rollDie: rolling(6)
    });

    expect(result).toEqual(createBaseRewardAllowances());
  });

  test("awards only the hint die at 72 remaining seconds", () => {
    const result = calculateRewardAllowances({
      previousGame: {
        mode: "timed",
        completed: true,
        remainingSeconds: HINT_REWARD_THRESHOLD_SECONDS
      },
      rollDie: rolling(5)
    });

    expect(result).toEqual({
      shuffleAllowance: 1,
      shuffleBonus: 0,
      shuffleDieRoll: null,
      hintAllowance: 6,
      hintBonus: 5,
      hintDieRoll: 5
    });
  });

  test("awards both dice at 108 remaining seconds", () => {
    const result = calculateRewardAllowances({
      previousGame: {
        mode: "timed",
        completed: true,
        remainingSeconds: SHUFFLE_REWARD_THRESHOLD_SECONDS
      },
      rollDie: rolling(4, 2)
    });

    expect(result).toEqual({
      shuffleAllowance: 5,
      shuffleBonus: 4,
      shuffleDieRoll: 4,
      hintAllowance: 3,
      hintBonus: 2,
      hintDieRoll: 2
    });
  });
});
