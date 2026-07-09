import type { GameMode } from "../game/types";

type HeaderProps = {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
};

export function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="game-header">
      <div>
        <p className="eyebrow">Pet Link</p>
        <h1>宠物连连看</h1>
      </div>
      <div className="header-controls" aria-label="游戏设置">
        <div className="segmented-control">
          <button className={mode === "relaxed" ? "active" : ""} onClick={() => onModeChange("relaxed")}>
            休闲
          </button>
          <button className={mode === "timed" ? "active" : ""} onClick={() => onModeChange("timed")}>
            限时
          </button>
        </div>
        <span className="board-badge">10 x 8</span>
      </div>
    </header>
  );
}
