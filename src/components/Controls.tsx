type ControlsProps = {
  paused: boolean;
  shuffleAllowance: number;
  hintAllowance: number;
  onNewGame: () => void;
  onHint: () => void;
  onShuffle: () => void;
  onPauseToggle: () => void;
};

export function Controls({ paused, shuffleAllowance, hintAllowance, onNewGame, onHint, onShuffle, onPauseToggle }: ControlsProps) {
  return (
    <section className="controls" aria-label="游戏操作">
      <button onClick={onNewGame}>新游戏</button>
      <button onClick={onHint} disabled={hintAllowance <= 0}>
        提示
      </button>
      <button onClick={onShuffle} disabled={shuffleAllowance <= 0}>
        打乱
      </button>
      <button onClick={onPauseToggle}>{paused ? "继续" : "暂停"}</button>
    </section>
  );
}
