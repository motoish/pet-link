import type { GameMode } from "../game/types";
import { t, type Language } from "../i18n/translations";

type StatusBarProps = {
  language: Language;
  mode: GameMode;
  elapsedSeconds: number;
  remainingSeconds: number;
  score: number;
  moves: number;
  remainingPairs: number;
  shuffleAllowance: number;
  hintAllowance: number;
  bestRelaxedTime: number | null;
  bestTimedScore: number | null;
};

export function StatusBar({
  language,
  mode,
  elapsedSeconds,
  remainingSeconds,
  score,
  moves,
  remainingPairs,
  shuffleAllowance,
  hintAllowance,
  bestRelaxedTime,
  bestTimedScore
}: StatusBarProps) {
  return (
    <section className="status-grid" aria-label="游戏状态">
      <StatusItem label={mode === "timed" ? t(language, "status.remainingTime") : t(language, "status.elapsed")} value={formatTime(mode === "timed" ? remainingSeconds : elapsedSeconds)} />
      <StatusItem label={t(language, "status.score")} value={String(score)} />
      <StatusItem label={t(language, "status.moves")} value={String(moves)} />
      <StatusItem label={t(language, "status.remainingPairs")} value={String(remainingPairs)} />
      <StatusItem label={t(language, "status.shuffle")} value={String(shuffleAllowance)} />
      <StatusItem label={t(language, "status.hint")} value={String(hintAllowance)} />
      <StatusItem label={t(language, "status.best")} value={mode === "timed" ? formatNullableScore(bestTimedScore) : formatNullableTime(bestRelaxedTime)} />
    </section>
  );
}

export function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function formatNullableTime(seconds: number | null): string {
  return seconds === null ? "-" : formatTime(seconds);
}

function formatNullableScore(score: number | null): string {
  return score === null ? "-" : String(score);
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="status-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
