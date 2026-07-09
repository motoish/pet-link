import type { Board, Point } from "./types";

export function findConnection(board: Board, from: Point, to: Point): Point[] | null {
  const fromCell = getOriginalCell(board, from);
  const toCell = getOriginalCell(board, to);

  if (!fromCell || !toCell || samePoint(from, to)) {
    return null;
  }

  if (!fromCell.tileId || fromCell.tileId !== toCell.tileId) {
    return null;
  }

  if (hasClearLine(board, from, to, from, to)) {
    return [from, to];
  }

  for (const corner of [
    { row: from.row, column: to.column },
    { row: to.row, column: from.column }
  ]) {
    if (
      isClear(board, corner, from, to) &&
      hasClearLine(board, from, corner, from, to) &&
      hasClearLine(board, corner, to, from, to)
    ) {
      return compactPath([from, corner, to]);
    }
  }

  for (let row = -1; row <= board.rows; row += 1) {
    const firstCorner = { row, column: from.column };
    const secondCorner = { row, column: to.column };

    if (
      isClear(board, firstCorner, from, to) &&
      isClear(board, secondCorner, from, to) &&
      hasClearLine(board, from, firstCorner, from, to) &&
      hasClearLine(board, firstCorner, secondCorner, from, to) &&
      hasClearLine(board, secondCorner, to, from, to)
    ) {
      return compactPath([from, firstCorner, secondCorner, to]);
    }
  }

  for (let column = -1; column <= board.columns; column += 1) {
    const firstCorner = { row: from.row, column };
    const secondCorner = { row: to.row, column };

    if (
      isClear(board, firstCorner, from, to) &&
      isClear(board, secondCorner, from, to) &&
      hasClearLine(board, from, firstCorner, from, to) &&
      hasClearLine(board, firstCorner, secondCorner, from, to) &&
      hasClearLine(board, secondCorner, to, from, to)
    ) {
      return compactPath([from, firstCorner, secondCorner, to]);
    }
  }

  return null;
}

function hasClearLine(board: Board, from: Point, to: Point, start: Point, end: Point): boolean {
  if (from.row !== to.row && from.column !== to.column) {
    return false;
  }

  const rowStep = Math.sign(to.row - from.row);
  const columnStep = Math.sign(to.column - from.column);
  let current = {
    row: from.row + rowStep,
    column: from.column + columnStep
  };

  while (!samePoint(current, to)) {
    if (!isClear(board, current, start, end)) {
      return false;
    }
    current = {
      row: current.row + rowStep,
      column: current.column + columnStep
    };
  }

  return true;
}

function isClear(board: Board, point: Point, start: Point, end: Point): boolean {
  if (!isInsidePaddedBoard(board, point)) {
    return false;
  }

  if (samePoint(point, start) || samePoint(point, end)) {
    return true;
  }

  const cell = getOriginalCell(board, point);
  return !cell || cell.tileId === null;
}

function isInsidePaddedBoard(board: Board, point: Point): boolean {
  return (
    point.row >= -1 &&
    point.row <= board.rows &&
    point.column >= -1 &&
    point.column <= board.columns
  );
}

function getOriginalCell(board: Board, point: Point) {
  if (
    point.row < 0 ||
    point.row >= board.rows ||
    point.column < 0 ||
    point.column >= board.columns
  ) {
    return null;
  }

  return board.cells[point.row][point.column];
}

function compactPath(points: Point[]): Point[] {
  const withoutDuplicates = points.filter((point, index) => {
    return index === 0 || !samePoint(point, points[index - 1]);
  });

  return withoutDuplicates.filter((point, index, path) => {
    const previous = path[index - 1];
    const next = path[index + 1];

    if (!previous || !next) {
      return true;
    }

    const sameRow = previous.row === point.row && point.row === next.row;
    const sameColumn = previous.column === point.column && point.column === next.column;
    return !sameRow && !sameColumn;
  });
}

function samePoint(first: Point, second: Point): boolean {
  return first.row === second.row && first.column === second.column;
}
