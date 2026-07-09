import { Tile } from "@src/components/Tile";
import { BOARD_COLUMNS, BOARD_ROWS } from "@src/game/board";
import type { Board as GameBoard, Point } from "@src/game/types";

type BoardProps = {
  board: GameBoard;
  selected: Point | null;
  hinted: Point[];
  connectionPath: Point[] | null;
  onTileClick: (point: Point) => void;
};

export function Board({ board, selected, hinted, connectionPath, onTileClick }: BoardProps) {
  return (
    <section className="board-wrap" aria-label="宠物棋盘">
      <div className="game-board">
        {board.cells.flat().map((cell) => (
          <Tile
            key={`${cell.row}-${cell.column}`}
            cell={cell}
            selected={Boolean(selected && samePoint(selected, cell))}
            hinted={hinted.some((point) => samePoint(point, cell))}
            onClick={onTileClick}
          />
        ))}
        {connectionPath && (
          <svg
            className="connection-layer"
            viewBox={`0 0 ${BOARD_COLUMNS} ${BOARD_ROWS}`}
            aria-hidden="true"
          >
            <polyline points={connectionPath.map(toSvgPoint).join(" ")} />
          </svg>
        )}
      </div>
    </section>
  );
}

function toSvgPoint(point: Point): string {
  const x = Math.max(0, Math.min(BOARD_COLUMNS, point.column + 0.5));
  const y = Math.max(0, Math.min(BOARD_ROWS, point.row + 0.5));
  return `${x},${y}`;
}

function samePoint(first: Point, second: Point): boolean {
  return first.row === second.row && first.column === second.column;
}
