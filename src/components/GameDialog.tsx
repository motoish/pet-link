type GameDialogProps = {
  state: "playing" | "paused" | "won" | "failed";
  title: string;
  detail: string;
  primaryLabel: string;
  resumeLabel: string;
  onPrimary: () => void;
  onResume: () => void;
};

export function GameDialog({ state, title, detail, primaryLabel, resumeLabel, onPrimary, onResume }: GameDialogProps) {
  if (state === "playing") {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="game-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{title}</h2>
        <p>{detail}</p>
        <div className="dialog-actions">
          {state === "paused" && <button onClick={onResume}>{resumeLabel}</button>}
          <button onClick={onPrimary}>{primaryLabel}</button>
        </div>
      </section>
    </div>
  );
}
