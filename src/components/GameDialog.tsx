type GameDialogProps = {
  state: "playing" | "paused" | "won" | "failed";
  title: string;
  detail: string;
  primaryLabel: string;
  resumeLabel: string;
  exitConfirmation: {
    title: string;
    detail: string;
    cancelLabel: string;
    confirmLabel: string;
    onCancel: () => void;
    onConfirm: () => void;
  } | null;
  onPrimary: () => void;
  onResume: () => void;
};

export function GameDialog({
  state,
  title,
  detail,
  primaryLabel,
  resumeLabel,
  exitConfirmation,
  onPrimary,
  onResume
}: GameDialogProps) {
  if (!exitConfirmation && state === "playing") {
    return null;
  }

  const dialogTitle = exitConfirmation?.title ?? title;
  const dialogDetail = exitConfirmation?.detail ?? detail;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="game-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <h2 id="dialog-title">{dialogTitle}</h2>
        <p>{dialogDetail}</p>
        <div className="dialog-actions">
          {exitConfirmation ? (
            <>
              <button onClick={exitConfirmation.onCancel}>{exitConfirmation.cancelLabel}</button>
              <button onClick={exitConfirmation.onConfirm}>{exitConfirmation.confirmLabel}</button>
            </>
          ) : (
            <>
              {state === "paused" && <button onClick={onResume}>{resumeLabel}</button>}
              <button onClick={onPrimary}>{primaryLabel}</button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
