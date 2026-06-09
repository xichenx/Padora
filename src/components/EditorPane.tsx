import type { ViewMode } from "../types";
import type { Strings } from "../i18n";
import { Icon } from "./Icon";

interface FindBarProps {
  L: Strings;
  findText: string;
  matchIndex: number;
  matchCount: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function FindBar({
  L,
  findText,
  matchIndex,
  matchCount,
  inputRef,
  onChange,
  onPrev,
  onNext,
  onClose,
}: FindBarProps) {
  return (
    <div className="find-bar">
      <div className="find-field">
        <input
          ref={inputRef}
          className="find-input"
          placeholder={L.findInFile}
          value={findText}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (e.shiftKey) onPrev();
              else onNext();
            }
          }}
        />
        <span className="find-count">
          {findText
            ? `${matchIndex >= 0 ? matchIndex + 1 : 0}/${matchCount}`
            : ""}
        </span>
      </div>
      <button
        className="find-icon"
        onClick={onPrev}
        disabled={matchCount === 0}
        title={L.findPrev}
      >
        <Icon name="up" size={15} />
      </button>
      <button
        className="find-icon"
        onClick={onNext}
        disabled={matchCount === 0}
        title={L.findNext}
      >
        <Icon name="down" size={15} />
      </button>
      <button className="find-icon" onClick={onClose} title={L.findClose}>
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}

interface EditorPaneProps {
  L: Strings;
  content: string;
  viewMode: ViewMode;
  splitRatio: number;
  showFind: boolean;
  findText: string;
  matchIndex: number;
  matchCount: number;
  findInputRef: React.RefObject<HTMLInputElement | null>;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onFindChange: (value: string) => void;
  onFindPrev: () => void;
  onFindNext: () => void;
  onFindClose: () => void;
}

export function EditorPane({
  L,
  content,
  viewMode,
  splitRatio,
  showFind,
  findText,
  matchIndex,
  matchCount,
  findInputRef,
  editorRef,
  onChange,
  onKeyDown,
  onPaste,
  onFindChange,
  onFindPrev,
  onFindNext,
  onFindClose,
}: EditorPaneProps) {
  return (
    <div
      className="pane editor-pane"
      style={
        viewMode === "split"
          ? { flex: `0 0 ${splitRatio * 100}%` }
          : undefined
      }
    >
      {showFind && (
        <FindBar
          L={L}
          findText={findText}
          matchIndex={matchIndex}
          matchCount={matchCount}
          inputRef={findInputRef}
          onChange={onFindChange}
          onPrev={onFindPrev}
          onNext={onFindNext}
          onClose={onFindClose}
        />
      )}
      <textarea
        ref={editorRef}
        className="editor"
        value={content}
        spellCheck={false}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={L.editorPlaceholder}
      />
    </div>
  );
}
