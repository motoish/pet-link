import { getPetTile } from "@src/assets/pets";
import type { Cell, Point } from "@src/game/types";
import type { CSSProperties } from "react";

type TileProps = {
  cell: Cell;
  selected: boolean;
  hinted: boolean;
  onClick: (point: Point) => void;
};

export function Tile({ cell, selected, hinted, onClick }: TileProps) {
  if (!cell.tileId) {
    return <div className="tile empty" aria-hidden="true" />;
  }

  const pet = getPetTile(cell.tileId);

  return (
    <button
      className={`tile ${selected ? "selected" : ""} ${hinted ? "hinted" : ""}`}
      style={{ "--tile-color": pet.color, "--tile-accent": pet.accent } as CSSProperties}
      onClick={() => onClick({ row: cell.row, column: cell.column })}
      aria-label={pet.name}
    >
      {pet.icon}
    </button>
  );
}
