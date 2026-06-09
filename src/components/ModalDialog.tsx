import type { ModalState } from "../types";
import type { Strings } from "../i18n";

interface ModalDialogProps {
  modal: ModalState;
  L: Strings;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChangeValue: (value: string) => void;
  onClose: (result: string | boolean | null) => void;
}

export function ModalDialog({
  modal,
  L,
  inputRef,
  onChangeValue,
  onClose,
}: ModalDialogProps) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={() =>
        onClose(modal.kind === "prompt" ? null : false)
      }
    >
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-message">{modal.message}</div>
        {modal.kind === "prompt" && (
          <input
            ref={inputRef}
            className="modal-input"
            value={modal.value}
            autoFocus
            onChange={(e) => onChangeValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onClose(modal.value);
              } else if (e.key === "Escape") {
                e.preventDefault();
                onClose(null);
              }
            }}
          />
        )}
        <div className="modal-actions">
          <button
            className="modal-btn"
            onClick={() => onClose(modal.kind === "prompt" ? null : false)}
          >
            {L.cancel}
          </button>
          <button
            className={`modal-btn primary ${modal.danger ? "danger" : ""}`}
            onClick={() => onClose(modal.kind === "prompt" ? modal.value : true)}
          >
            {L.ok}
          </button>
        </div>
      </div>
    </div>
  );
}
