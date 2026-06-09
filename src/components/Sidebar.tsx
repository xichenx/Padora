import type { FileNode, Heading, SearchResult, SidebarTab } from "../types";
import type { Strings } from "../i18n";
import { baseName } from "../lib/paths";
import { highlightText } from "../lib/highlightText";
import { Icon } from "./Icon";

interface SidebarProps {
  L: Strings;
  width: number;
  tab: SidebarTab;
  tree: FileNode | null;
  openedFiles: string[];
  filePath: string;
  globalQuery: string;
  searchResults: SearchResult[];
  searching: boolean;
  totalMatches: number;
  globalInputRef: React.RefObject<HTMLInputElement | null>;
  onTabChange: (tab: SidebarTab) => void;
  onOpenSearch: () => void;
  onLoadFile: (path: string, jump?: { line: number; query: string }) => void;
  onOpenFile: () => void;
  onRemoveOpened: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
  onGlobalQueryChange: (query: string) => void;
}

export function Sidebar({
  L,
  width,
  tab,
  tree,
  openedFiles,
  filePath,
  globalQuery,
  searchResults,
  searching,
  totalMatches,
  globalInputRef,
  onTabChange,
  onOpenSearch,
  onLoadFile,
  onOpenFile,
  onRemoveOpened,
  onContextMenu,
  onGlobalQueryChange,
}: SidebarProps) {
  return (
    <aside className="sidebar" style={{ width }}>
      <div className="sidebar-tabs">
        <button
          className={`sb-tab ${tab === "files" ? "active" : ""}`}
          onClick={() => onTabChange("files")}
        >
          {L.tabFiles}
        </button>
        <button
          className={`sb-tab ${tab === "search" ? "active" : ""}`}
          onClick={onOpenSearch}
        >
          {L.tabSearch}
        </button>
      </div>

      {tab === "files" ? (
        <div className="sidebar-body">
          {openedFiles.length > 0 ? (
            <div className="opened-list">
              {openedFiles.map((p) => (
                <div
                  key={p}
                  className={`opened-item ${p === filePath ? "active" : ""}`}
                  title={p}
                  onClick={() => onLoadFile(p)}
                  onContextMenu={(e) =>
                    onContextMenu(e, {
                      name: baseName(p),
                      path: p,
                      is_dir: false,
                      children: [],
                    })
                  }
                >
                  <span className="tree-icon">📄</span>
                  <span className="tree-label">{baseName(p)}</span>
                  <button
                    className="opened-remove"
                    title={L.removeFromList}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveOpened(p);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="sidebar-empty">
              <p>{L.noOpenedFiles}</p>
              <button className="tb-btn" onClick={onOpenFile}>
                {L.openFileBtn}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="sidebar-body">
          <div className="search-box">
            <Icon name="search" size={14} />
            <input
              ref={globalInputRef}
              className="search-input"
              placeholder={
                tree ? L.searchPlaceholder : L.searchPlaceholderNoFolder
              }
              value={globalQuery}
              disabled={!tree}
              onChange={(e) => onGlobalQueryChange(e.target.value)}
            />
            {globalQuery && (
              <button
                className="search-clear"
                onClick={() => onGlobalQueryChange("")}
                title={L.clear}
              >
                ✕
              </button>
            )}
          </div>

          {globalQuery.trim() && (
            <div className="search-summary">
              {searching
                ? L.searching
                : L.searchSummary(searchResults.length, totalMatches)}
            </div>
          )}

          <div className="search-results">
            {searchResults.map((r) => (
              <div key={r.path} className="search-file">
                <div
                  className="search-file-head"
                  title={r.path}
                  onClick={() =>
                    onLoadFile(r.path, {
                      line: r.matches[0].line,
                      query: globalQuery.trim(),
                    })
                  }
                >
                  <span className="tree-icon">📄</span>
                  <span className="tree-label">{r.name}</span>
                  <span className="search-file-count">{r.matches.length}</span>
                </div>
                {r.matches.map((m, i) => (
                  <div
                    key={`${r.path}-${m.line}-${i}`}
                    className="search-line"
                    title={m.text}
                    onClick={() =>
                      onLoadFile(r.path, {
                        line: m.line,
                        query: globalQuery.trim(),
                      })
                    }
                  >
                    <span className="search-line-no">{m.line}</span>
                    <span className="search-line-text">
                      {highlightText(m.text, globalQuery.trim())}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

interface OutlinePanelProps {
  L: Strings;
  headings: Heading[];
  activeHeading: string;
  onScrollTo: (id: string) => void;
}

export function OutlinePanel({
  L,
  headings,
  activeHeading,
  onScrollTo,
}: OutlinePanelProps) {
  return (
    <aside className="outline">
      <div className="outline-title">{L.outlineTitle}</div>
      {headings.length === 0 ? (
        <div className="outline-empty">{L.noHeading}</div>
      ) : (
        headings.map((h, i) => (
          <div
            key={`${h.id}-${i}`}
            className={`outline-item ${h.id === activeHeading ? "active" : ""}`}
            style={{ paddingLeft: 8 + (h.level - 1) * 14 }}
            onClick={() => onScrollTo(h.id)}
            title={h.text}
          >
            {h.text}
          </div>
        ))
      )}
    </aside>
  );
}
