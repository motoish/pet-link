export type GameMode = "relaxed" | "timed";

export type Point = {
  row: number;
  column: number;
};

export type Cell = Point & {
  tileId: string | null;
};

export type Board = {
  rows: number;
  columns: number;
  cells: Cell[][];
};

export type RandomFn = () => number;

export type MatchHint = {
  first: Point;
  second: Point;
};
