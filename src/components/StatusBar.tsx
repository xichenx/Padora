import type { ViewMode } from "../types";
import type { Strings } from "../i18n";

interface StatusBarProps {
  L: Strings;
  viewMode: ViewMode;
  words: number;
  chars: number;
  lines: number;
  dirty: boolean;
  filePath: string;
}

export function StatusBar({
  L,
  viewMode,
  words,
  chars,
  lines,
  dirty,
  filePath,
}: StatusBarProps) {
  const viewLabel =
    viewMode === "preview"
      ? L.viewPreview
      : viewMode === "split"
        ? L.viewSplit
        : L.viewSource;

  return (
    <footer className="statusbar">
      <div className="status-left">
        <span className="status-mode">{viewLabel}</span>
        <span className="status-sep" />
        <span>{L.words(words)}</span>
        <span>{L.chars(chars)}</span>
        <span>{L.lines(lines)}</span>
      </div>
      <div className="status-right">
        {dirty ? L.unsaved : filePath ? L.saved : L.newDoc}
      </div>
    </footer>
  );
}

interface ContentAreaProps {
  error: string;
  viewMode: ViewMode;
  paneHostRef: React.RefObject<HTMLDivElement | null>;
  editor: React.ReactNode;
  preview: React.ReactNode;
  onSplitResize: (e: React.MouseEvent) => void;
}

export function ContentArea({
  error,
  viewMode,
  paneHostRef,
  editor,
  preview,
  onSplitResize,
}: ContentAreaProps) {
  return (
    <main className="content-wrap">
      {error && <div className="error-bar">{error}</div>}
      <div className={`pane-host mode-${viewMode}`} ref={paneHostRef}>
        {viewMode === "source" && editor}
        {viewMode === "split" && (
          <>
            {editor}
            <div className="resizer-v" onMouseDown={onSplitResize} />
            {preview}
          </>
        )}
        {viewMode === "preview" && preview}
      </div>
    </main>
  );
}
