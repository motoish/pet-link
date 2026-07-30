import type { Language } from "@src/i18n/translations";
import { t } from "@src/i18n/translations";

type HeaderProps = {
  language: Language;
};

export function Header({ language }: HeaderProps) {
  return (
    <header className="game-header">
      <div>
        <p className="eyebrow">{t(language, "app.eyebrow")}</p>
        <h1>{t(language, "app.title")}</h1>
      </div>
      <span className="board-badge">{t(language, "board.size")}</span>
    </header>
  );
}
