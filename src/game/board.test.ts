import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  clearCells,
  countRemainingPairs,
  createBoard,
  findAvailablePair,
  getCell,
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
