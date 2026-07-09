import { findConnection } from "@src/game/pathfinding";
import type { Board } from "@src/game/types";
import { describe, expect, test } from "vitest";

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

function expectPathWithMaxTurns(path: Array<{ row: number; column: number }>, maxTurns: number) {
  let turns = 0;
  let previousDirection: string | null = null;

  for (let index = 1; index < path.length; index += 1) {
    const previous = path[index - 1];
    const current = path[index];
    const direction = previous.row === current.row ? "horizontal" : "vertical";

    if (previousDirection && previousDirection !== direction) {
      turns += 1;
    }
    previousDirection = direction;
  }

  expect(turns).toBeLessThanOrEqual(maxTurns);
}

describe("findConnection", () => {
  test("connects matching tiles in a direct line", () => {
    const board = boardFromRows([["cat", null, "cat"]]);

    const path = findConnection(board, { row: 0, column: 0 }, { row: 0, column: 2 });

    expect(path).toEqual([
      { row: 0, column: 0 },
      { row: 0, column: 2 }
    ]);
  });

  test("connects matching tiles with one turn", () => {
    const board = boardFromRows([
      ["cat", null],
      [null, "cat"]
    ]);

    const path = findConnection(board, { row: 0, column: 0 }, { row: 1, column: 1 });

    expect(path).not.toBeNull();
    expectPathWithMaxTurns(path!, 1);
  });

  test("connects matching tiles with two turns", () => {
    const board = boardFromRows([
      ["cat", "dog", "dog", "cat"],
      [null, null, null, null]
    ]);

    const path = findConnection(board, { row: 0, column: 0 }, { row: 0, column: 3 });

    expect(path).not.toBeNull();
    expectPathWithMaxTurns(path!, 2);
  });

  test("connects through the outside border when the inside route is blocked", () => {
    const board = boardFromRows([
      ["cat", "dog", "cat"],
      ["dog", "dog", "dog"]
    ]);

    const path = findConnection(board, { row: 0, column: 0 }, { row: 0, column: 2 });

    expect(path).not.toBeNull();
    expect(path!.some((point) => point.row < 0 || point.column < 0)).toBe(true);
    expectPathWithMaxTurns(path!, 2);
  });

  test("does not connect when all possible routes are blocked", () => {
    const board = boardFromRows([
      ["dog", "dog", "dog", "dog", "dog"],
      ["dog", "dog", "dog", "dog", "dog"],
      ["dog", "cat", "dog", "cat", "dog"],
      ["dog", "dog", "dog", "dog", "dog"],
      ["dog", "dog", "dog", "dog", "dog"]
    ]);

    const path = findConnection(board, { row: 2, column: 1 }, { row: 2, column: 3 });

    expect(path).toBeNull();
  });

  test("does not connect different tile ids", () => {
    const board = boardFromRows([["cat", null, "dog"]]);

    const path = findConnection(board, { row: 0, column: 0 }, { row: 0, column: 2 });

    expect(path).toBeNull();
  });

  test("does not connect empty cells", () => {
    const board = boardFromRows([[null, null]]);

    const path = findConnection(board, { row: 0, column: 0 }, { row: 0, column: 1 });

    expect(path).toBeNull();
  });
});
