import type { Theme, ViewMode } from "../types";
import type { Lang, Strings } from "../i18n";
import { LANGS } from "../i18n";
import { Icon } from "./Icon";

interface ToolbarProps {
  L: Strings;
  lang: Lang;
  theme: Theme;
  viewMode: ViewMode;
  showSidebar: boolean;
  showOutline: boolean;
  fileName: string;
  filePath: string;
  dirty: boolean;
  onToggleSidebar: () => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onSave: () => void;
  onFind: () => void;
  onViewMode: (mode: ViewMode) => void;
  onToggleOutline: () => void;
  onToggleLang: () => void;
  onToggleTheme: () => void;
}

export function Toolbar({
  L,
  lang,
  theme,
  viewMode,
  showSidebar,
  showOutline,
  fileName,
  filePath,
  dirty,
  onToggleSidebar,
  onOpenFile,
  onOpenFolder,
  onSave,
  onFind,
  onViewMode,
  onToggleOutline,
  onToggleLang,
  onToggleTheme,
}: ToolbarProps) {
  return (
    <header className="toolbar" data-tauri-drag-region>
      <div className="toolbar-left">
        <button
          className={`icon-btn ${showSidebar ? "active" : ""}`}
          onClick={onToggleSidebar}
          title={L.fileTree}
        >
          <Icon name="sidebar" />
        </button>
        <span className="tb-sep" />
        <button className="icon-btn" onClick={onOpenFile} title={L.openFile}>
          <Icon name="file" />
        </button>
        <button className="icon-btn" onClick={onOpenFolder} title={L.openFolder}>
          <Icon name="folder" />
        </button>
        <button className="icon-btn" onClick={onSave} title={L.save}>
          <Icon name="save" />
        </button>
        <button className="icon-btn" onClick={onFind} title={L.find}>
          <Icon name="search" />
        </button>
      </div>

      <div className="toolbar-title" title={filePath} data-tauri-drag-region>
        {dirty && <span className="dirty-dot" />}
        <span className="title-text">{fileName}</span>
      </div>

      <div className="toolbar-right">
        <div className="view-switch">
          {(["preview", "split", "source"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={`seg ${viewMode === mode ? "active" : ""}`}
              onClick={() => onViewMode(mode)}
            >
              {mode === "preview"
                ? L.viewPreview
                : mode === "split"
                  ? L.viewSplit
                  : L.viewSource}
            </button>
          ))}
        </div>
        <span className="tb-sep" />
        <button
          className={`icon-btn ${showOutline ? "active" : ""}`}
          onClick={onToggleOutline}
          title={L.outline}
        >
          <Icon name="list" />
        </button>
        <button
          className="icon-btn lang-btn"
          onClick={onToggleLang}
          title={L.switchLang}
        >
          {lang === "zh" ? "中" : "EN"}
        </button>
        <button className="icon-btn" onClick={onToggleTheme} title={L.toggleTheme}>
          <Icon name={theme === "light" ? "moon" : "sun"} />
        </button>
      </div>
    </header>
  );
}

export function cycleLang(current: Lang): Lang {
  const i = LANGS.findIndex((x) => x.id === current);
  return LANGS[(i + 1) % LANGS.length].id;
}
