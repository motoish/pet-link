import { formatTime } from "@src/components/StatusBar";
import type { GameMode } from "@src/game/types";
import type { Language } from "@src/i18n/translations";
import { LANGUAGES, t } from "@src/i18n/translations";

type ModeSelectProps = {
  language: Language;
  lastMode: GameMode;
  bestRelaxedTime: number | null;
  bestTimedScore: number | null;
  onStart: (mode: GameMode) => void;
  onLanguageChange: (language: Language) => void;
};

export function ModeSelect({
  language,
  lastMode,
  bestRelaxedTime,
  bestTimedScore,
  onStart,
  onLanguageChange
}: ModeSelectProps) {
  return (
    <main className="mode-menu">
      <section className="mode-menu-card" aria-labelledby="mode-menu-title">
        <header className="mode-menu-header">
          <div>
            <p className="eyebrow">{t(language, "app.eyebrow")}</p>
            <h1>{t(language, "app.title")}</h1>
          </div>
          <label className="language-select">
            <span>{t(language, "settings.language")}</span>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as Language)}
            >
              {LANGUAGES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className="mode-menu-intro">
          <h2 id="mode-menu-title">{t(language, "menu.chooseMode")}</h2>
          <p>{t(language, "menu.description")}</p>
        </div>

        <div className="mode-options">
          <ModeOption
            mode="relaxed"
            language={language}
            isLastPlayed={lastMode === "relaxed"}
            bestValue={bestRelaxedTime === null ? "-" : formatTime(bestRelaxedTime)}
            onStart={onStart}
          />
          <ModeOption
            mode="timed"
            language={language}
            isLastPlayed={lastMode === "timed"}
            bestValue={bestTimedScore === null ? "-" : String(bestTimedScore)}
            onStart={onStart}
          />
        </div>
      </section>
    </main>
  );
}

function ModeOption({
  mode,
  language,
  isLastPlayed,
  bestValue,
  onStart
}: {
  mode: GameMode;
  language: Language;
  isLastPlayed: boolean;
  bestValue: string;
  onStart: (mode: GameMode) => void;
}) {
  return (
    <button
      type="button"
      className={`mode-option${isLastPlayed ? " last-played" : ""}`}
      onClick={() => onStart(mode)}
    >
      <span className="mode-option-title">{t(language, `mode.${mode}`)}</span>
      <span className="mode-best">
        {t(language, "menu.best")} {bestValue}
      </span>
      {isLastPlayed && <span className="last-played-badge">{t(language, "menu.lastPlayed")}</span>}
    </button>
  );
}
