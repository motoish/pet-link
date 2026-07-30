import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  applyMatch,
  clearCells,
  countRemainingPairs,
  createBoard,
  ensureBoardHasMatch,
  findAvailablePair,
  getCell,
  resolveDeadlock,
  shuffleRemainingTiles
} from "@src/game/board";
import type { Board, Point } from "@src/game/types";
import { describe, expect, test } from "vitest";

const PET_IDS = [
  "cat",
  "dog",
  "rabbit",
  "hamster",
  "bird",
  "fish",
  "turtle",
  "fox",
  "bear",
  "panda",
  "chick",
  "frog"
];

function tileCounts(board: Board) {
  const counts = new Map<string, number>();

  for (const row of board.cells) {
    for (const cell of row) {
      if (cell.tileId) {
        counts.set(cell.tileId, (counts.get(cell.tileId) ?? 0) + 1);
      }
    }
  }

  return counts;
}

function boardFromRows(rows: Array<Array<string | null>>): Board {
  return {
    rows: rows.length,
    columns: rows[0].length,
    cells: rows.map((row, rowIndex) =>
      row.map((tileId, columnIndex) => ({
        row: rowIndex,
        column: columnIndex,
        tileId
      }))
    )
  };
}

describe("createBoard", () => {
  test("creates the fixed 10x8 board with every cell occupied", () => {
    const board = createBoard(PET_IDS, () => 0.5);

    expect(board.rows).toBe(BOARD_ROWS);
    expect(board.columns).toBe(BOARD_COLUMNS);
    expect(board.cells).toHaveLength(8);
    expect(board.cells[0]).toHaveLength(10);
    expect(board.cells.flat().filter((cell) => cell.tileId)).toHaveLength(80);
  });

  test("creates tile pairs across the whole board", () => {
    const board = createBoard(PET_IDS, () => 0.5);
    const counts = tileCounts(board);

    expect(countRemainingPairs(board)).toBe(40);
    for (const count of counts.values()) {
      expect(count % 2).toBe(0);
    }
  });

  test("reads and clears cells by coordinate without moving other cells", () => {
    const board = createBoard(PET_IDS, () => 0.5);
    const first: Point = { row: 0, column: 0 };
    const second: Point = { row: 0, column: 1 };
    const originalThird = getCell(board, { row: 0, column: 2 });

    const cleared = clearCells(board, first, second);

    expect(getCell(cleared, first).tileId).toBeNull();
    expect(getCell(cleared, second).tileId).toBeNull();
    expect(getCell(cleared, { row: 0, column: 2 })).toEqual(originalThird);
    expect(countRemainingPairs(cleared)).toBe(39);
  });
});

describe("shuffleRemainingTiles", () => {
  test("preserves empty cells and the remaining tile multiset", () => {
    const board = createBoard(PET_IDS, () => 0.5);
    const cleared = clearCells(board, { row: 0, column: 0 }, { row: 0, column: 1 });
    const beforeCounts = tileCounts(cleared);

    const shuffled = shuffleRemainingTiles(cleared, () => 0);

    expect(getCell(shuffled, { row: 0, column: 0 }).tileId).toBeNull();
    expect(getCell(shuffled, { row: 0, column: 1 }).tileId).toBeNull();
    expect(tileCounts(shuffled)).toEqual(beforeCounts);
  });
});

describe("findAvailablePair", () => {
  test("returns the first removable matching pair", () => {
    const board = boardFromRows([
      ["cat", null, "cat"],
      ["dog", "dog", null]
    ]);

    const hint = findAvailablePair(board);

    expect(hint).toEqual({
      first: { row: 0, column: 0 },
      second: { row: 0, column: 2 }
    });
  });

  test("returns null when no matching pair can connect", () => {
    const board = boardFromRows([["cat", null, "dog"]]);

    expect(findAvailablePair(board)).toBeNull();
  });
});

// 对角同色、四格填满，任何路线都会被另一种宠物挡住，是最小的死局盘面
function deadlockBoard(): Board {
  return boardFromRows([
    ["cat", "dog"],
    ["dog", "cat"]
  ]);
}

describe("ensureBoardHasMatch", () => {
  test("keeps a board that already has a connectable pair", () => {
    const board = boardFromRows([["cat", "cat"]]);

    expect(ensureBoardHasMatch(board, () => 0)).toBe(board);
  });

  test("reshuffles a deadlocked board until a pair can connect", () => {
    const board = ensureBoardHasMatch(deadlockBoard(), () => 0);

    expect(findAvailablePair(board)).not.toBeNull();
    expect(tileCounts(board)).toEqual(tileCounts(deadlockBoard()));
  });
});

describe("resolveDeadlock", () => {
  test("reports a playable board without touching it", () => {
    const board = boardFromRows([["cat", "cat"]]);

    const outcome = resolveDeadlock(board, 1, () => 0);

    expect(outcome).toEqual({ kind: "playable", board });
  });

  test("shuffles a deadlocked board when a shuffle is still available", () => {
    const outcome = resolveDeadlock(deadlockBoard(), 1, () => 0);

    expect(outcome.kind).toBe("shuffled");
    if (outcome.kind !== "shuffled") {
      return;
    }
    expect(findAvailablePair(outcome.board)).not.toBeNull();
    expect(tileCounts(outcome.board)).toEqual(tileCounts(deadlockBoard()));
  });

  test("reports exhausted on a deadlocked board with no shuffle left", () => {
    expect(resolveDeadlock(deadlockBoard(), 0, () => 0)).toEqual({ kind: "exhausted" });
  });

  test("reports exhausted when reshuffling cannot produce a connectable pair", () => {
    const board = boardFromRows([["cat", "dog"]]);

    expect(resolveDeadlock(board, 5, () => 0)).toEqual({ kind: "exhausted" });
  });
});

describe("applyMatch", () => {
  const first: Point = { row: 0, column: 0 };
  const second: Point = { row: 0, column: 1 };

  test("reports a win when the last pair is cleared even without shuffles left", () => {
    const board = boardFromRows([["cat", "cat"]]);

    const outcome = applyMatch(board, first, second, 0, () => 0);

    expect(outcome.kind).toBe("won");
    expect(countRemainingPairs(outcome.board)).toBe(0);
  });

  test("reports a plain clear while playable tiles remain", () => {
    const board = boardFromRows([
      ["cat", "cat"],
      ["dog", "dog"]
    ]);

    const outcome = applyMatch(board, first, second, 1, () => 0);

    expect(outcome.kind).toBe("cleared");
    expect(getCell(outcome.board, first).tileId).toBeNull();
    expect(getCell(outcome.board, second).tileId).toBeNull();
  });

  test("auto shuffles when clearing leads to a deadlock and a shuffle remains", () => {
    const board = boardFromRows([
      ["cat", "cat", null, null],
      [null, null, "dog", "fox"],
      [null, null, "fox", "dog"]
    ]);

    const outcome = applyMatch(board, first, second, 1, () => 0);

    expect(outcome.kind).toBe("autoShuffled");
    expect(findAvailablePair(outcome.board)).not.toBeNull();
  });

  test("reports a deadlock when clearing leads to a deadlock with no shuffle left", () => {
    const board = boardFromRows([
      ["cat", "cat", null, null],
      [null, null, "dog", "fox"],
      [null, null, "fox", "dog"]
    ]);

    const outcome = applyMatch(board, first, second, 0, () => 0);

    expect(outcome.kind).toBe("deadlocked");
    expect(findAvailablePair(outcome.board)).toBeNull();
  });
});
