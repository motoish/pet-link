import { describe, expect, test } from "vitest";
import { calculateNextShuffleAllowance } from "./shuffleRewards";

describe("calculateNextShuffleAllowance", () => {
  test("starts with one shuffle when there is no previous completion", () => {
    const result = calculateNextShuffleAllowance({ previousGame: null, rollDie: () => 6 });

    expect(result.allowance).toBe(1);
    expect(result.bonus).toBe(0);
    expect(result.dieRoll).toBeNull();
  });

  test("does not award a bonus for failed timed games", () => {
    const result = calculateNextShuffleAllowance({
      previousGame: { mode: "timed", completed: false, remainingSeconds: 180 },
      rollDie: () => 6
    });

    expect(result.allowance).toBe(1);
    expect(result.bonus).toBe(0);
    expect(result.dieRoll).toBeNull();
  });

  test("does not award a bonus for relaxed games", () => {
    const result = calculateNextShuffleAllowance({
      previousGame: { mode: "relaxed", completed: true, remainingSeconds: null },
      rollDie: () => 6
    });

    expect(result.allowance).toBe(1);
    expect(result.bonus).toBe(0);
    expect(result.dieRoll).toBeNull();
  });

  test("does not award a bonus below 108 remaining seconds", () => {
    const result = calculateNextShuffleAllowance({
      previousGame: { mode: "timed", completed: true, remainingSeconds: 107 },
      rollDie: () => 6
    });

    expect(result.allowance).toBe(1);
    expect(result.bonus).toBe(0);
    expect(result.dieRoll).toBeNull();
  });

  test("adds one die roll as bonus at 108 remaining seconds", () => {
    const result = calculateNextShuffleAllowance({
      previousGame: { mode: "timed", completed: true, remainingSeconds: 108 },
      rollDie: () => 4
    });

    expect(result.allowance).toBe(5);
    expect(result.bonus).toBe(4);
    expect(result.dieRoll).toBe(4);
  });
});
