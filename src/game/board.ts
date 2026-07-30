import { findConnection } from "@src/game/pathfinding";
import type { Board, Cell, MatchHint, Point, RandomFn } from "@src/game/types";

export const BOARD_COLUMNS = 10;
export const BOARD_ROWS = 8;
const CELL_COUNT = BOARD_COLUMNS * BOARD_ROWS;
const MAX_RESHUFFLE_ATTEMPTS = 20;

export type DeadlockOutcome =
  | { kind: "playable"; board: Board }
  | { kind: "shuffled"; board: Board }
  | { kind: "exhausted" };

export type MatchOutcome =
  | { kind: "won"; board: Board }
  | { kind: "cleared"; board: Board }
  | { kind: "autoShuffled"; board: Board }
  | { kind: "deadlocked"; board: Board };

export function createBoard(tileIds: string[], random: RandomFn = Math.random): Board {
  if (tileIds.length === 0) {
    throw new Error("createBoard requires at least one tile id");
  }

  const pairedTiles: string[] = [];
  for (let pairIndex = 0; pairIndex < CELL_COUNT / 2; pairIndex += 1) {
    const tileId = tileIds[pairIndex % tileIds.length];
    pairedTiles.push(tileId, tileId);
  }

  const shuffledTiles = shuffleArray(pairedTiles, random);
  const cells: Cell[][] = [];

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    const rowCells: Cell[] = [];
    for (let column = 0; column < BOARD_COLUMNS; column += 1) {
      rowCells.push({
        row,
        column,
        tileId: shuffledTiles[row * BOARD_COLUMNS + column]
      });
    }
    cells.push(rowCells);
  }

  return {
    rows: BOARD_ROWS,
    columns: BOARD_COLUMNS,
    cells
  };
}

export function getCell(board: Board, point: Point): Cell {
  return board.cells[point.row][point.column];
}

export function clearCells(board: Board, first: Point, second: Point): Board {
  return mapBoard(board, (cell) => {
    if (samePoint(cell, first) || samePoint(cell, second)) {
      return { ...cell, tileId: null };
    }
    return cell;
  });
}

export function countRemainingPairs(board: Board): number {
  const occupiedCount = board.cells.flat().filter((cell) => cell.tileId !== null).length;
  return occupiedCount / 2;
}

export function shuffleRemainingTiles(board: Board, random: RandomFn = Math.random): Board {
  const remainingTiles = board.cells
    .flat()
    .map((cell) => cell.tileId)
    .filter((tileId): tileId is string => tileId !== null);
  const shuffledTiles = shuffleArray(remainingTiles, random);
  let nextTileIndex = 0;

  return mapBoard(board, (cell) => {
    if (cell.tileId === null) {
      return cell;
    }

    const tileId = shuffledTiles[nextTileIndex];
    nextTileIndex += 1;
    return { ...cell, tileId };
  });
}

export function findAvailablePair(board: Board): MatchHint | null {
  const occupiedCells = board.cells.flat().filter((cell) => cell.tileId !== null);

  for (let firstIndex = 0; firstIndex < occupiedCells.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < occupiedCells.length; secondIndex += 1) {
      const first = occupiedCells[firstIndex];
      const second = occupiedCells[secondIndex];

      if (first.tileId === second.tileId && findConnection(board, first, second)) {
        return {
          first: { row: first.row, column: first.column },
          second: { row: second.row, column: second.column }
        };
      }
    }
  }

  return null;
}

export function ensureBoardHasMatch(board: Board, random: RandomFn = Math.random): Board {
  let nextBoard = board;

  for (let attempt = 0; attempt < MAX_RESHUFFLE_ATTEMPTS; attempt += 1) {
    if (findAvailablePair(nextBoard)) {
      return nextBoard;
    }
    nextBoard = shuffleRemainingTiles(nextBoard, random);
  }

  return nextBoard;
}

export function resolveDeadlock(
  board: Board,
  shuffleAllowance: number,
  random: RandomFn = Math.random
): DeadlockOutcome {
  if (findAvailablePair(board)) {
    return { kind: "playable", board };
  }

  if (shuffleAllowance <= 0) {
    return { kind: "exhausted" };
  }

  const shuffledBoard = ensureBoardHasMatch(board, random);
  if (!findAvailablePair(shuffledBoard)) {
    return { kind: "exhausted" };
  }

  return { kind: "shuffled", board: shuffledBoard };
}

export function applyMatch(
  board: Board,
  first: Point,
  second: Point,
  shuffleAllowance: number,
  random: RandomFn = Math.random
): MatchOutcome {
  const clearedBoard = clearCells(board, first, second);

  // 通关必须先于死局判定：空棋盘同样找不到可配对宠物，顺序反了会把胜利判成死局
  if (countRemainingPairs(clearedBoard) === 0) {
    return { kind: "won", board: clearedBoard };
  }

  const outcome = resolveDeadlock(clearedBoard, shuffleAllowance, random);

  if (outcome.kind === "playable") {
    return { kind: "cleared", board: clearedBoard };
  }

  if (outcome.kind === "shuffled") {
    return { kind: "autoShuffled", board: outcome.board };
  }

  return { kind: "deadlocked", board: clearedBoard };
}

function mapBoard(board: Board, mapCell: (cell: Cell) => Cell): Board {
  return {
    ...board,
    cells: board.cells.map((row) => row.map(mapCell))
  };
}

function samePoint(first: Point, second: Point): boolean {
  return first.row === second.row && first.column === second.column;
}

function shuffleArray<T>(items: T[], random: RandomFn): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}
