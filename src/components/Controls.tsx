import { t, type Language } from "../i18n/translations";

type ControlsProps = {
  language: Language;
  paused: boolean;
  shuffleAllowance: number;
  hintAllowance: number;
  onNewGame: () => void;
  onHint: () => void;
  onShuffle: () => void;
  onPauseToggle: () => void;
};

export function Controls({ language, paused, shuffleAllowance, hintAllowance, onNewGame, onHint, onShuffle, onPauseToggle }: ControlsProps) {
  return (
    <section className="controls" aria-label="游戏操作">
      <button onClick={onNewGame}>{t(language, "controls.newGame")}</button>
      <button onClick={onHint} disabled={hintAllowance <= 0}>
        {t(language, "controls.hint")}
      </button>
      <button onClick={onShuffle} disabled={shuffleAllowance <= 0}>
        {t(language, "controls.shuffle")}
      </button>
      <button onClick={onPauseToggle}>{paused ? t(language, "controls.resume") : t(language, "controls.pause")}</button>
    </section>
  );
}
