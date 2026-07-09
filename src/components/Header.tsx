import type { GameMode } from "@src/game/types";
import type { Language } from "@src/i18n/translations";
import { LANGUAGES, t } from "@src/i18n/translations";

type HeaderProps = {
  mode: GameMode;
  language: Language;
  onModeChange: (mode: GameMode) => void;
  onLanguageChange: (language: Language) => void;
};

export function Header({ mode, language, onModeChange, onLanguageChange }: HeaderProps) {
  return (
    <header className="game-header">
      <div>
        <p className="eyebrow">{t(language, "app.eyebrow")}</p>
        <h1>{t(language, "app.title")}</h1>
      </div>
      <div className="header-controls" aria-label="游戏设置">
        <div className="segmented-control">
          <button
            className={mode === "relaxed" ? "active" : ""}
            onClick={() => onModeChange("relaxed")}
          >
            {t(language, "mode.relaxed")}
          </button>
          <button
            className={mode === "timed" ? "active" : ""}
            onClick={() => onModeChange("timed")}
          >
            {t(language, "mode.timed")}
          </button>
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
        <span className="board-badge">{t(language, "board.size")}</span>
      </div>
    </header>
  );
}
