import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { open, save } from "@tauri-apps/plugin-dialog";

import {
  type Lang,
  STRINGS,
  detectLang,
  persistLang,
  welcomeDoc,
} from "./i18n";
import type { ContextMenuState, FileJump, FileNode, SidebarTab } from "./types";
import { IMAGE_EXT, MD_EXT } from "./lib/constants";
import { IS_TAURI } from "./lib/env";
import { dirOf } from "./lib/paths";
import { PREFS } from "./lib/prefs";
import {
  createMarkdown,
  deletePath,
  getFileName,
  importImage,
  readFile,
  rebuildMenu,
  renamePath,
  saveImageBytes,
  scanDir,
  writeFile,
} from "./services/tauri";
import { useModal } from "./hooks/useModal";
import { usePreferences } from "./hooks/usePreferences";
import { useFind } from "./hooks/useFind";
import { useGlobalSearch } from "./hooks/useGlobalSearch";
import { useOutline } from "./hooks/useOutline";
import { useEditorKeyDown, useEditorMutations } from "./hooks/useEditor";
import {
  useContextMenuDismiss,
  useDirtyCloseGuard,
  useDragDrop,
  useKeyboardShortcuts,
  useLangSync,
  useMenuListener,
  useStartupRestore,
} from "./hooks/useTauriLifecycle";

import { Toolbar, cycleLang } from "./components/Toolbar";
import { Sidebar, OutlinePanel } from "./components/Sidebar";
import { EditorPane } from "./components/EditorPane";
import { MarkdownPreview } from "./components/MarkdownPreview";
import { StatusBar, ContentArea } from "./components/StatusBar";
import { ContextMenu } from "./components/ContextMenu";
import { ModalDialog } from "./components/ModalDialog";

import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import "./App.css";

const INITIAL_LANG = detectLang();

function App() {
  const [lang, setLang] = useState<Lang>(INITIAL_LANG);
  const L = STRINGS[lang];

  const [content, setContent] = useState(() => welcomeDoc(INITIAL_LANG));
  const [filePath, setFilePath] = useState("");
  const [fileName, setFileName] = useState(() => STRINGS[INITIAL_LANG].welcomeTitle);
  const [tree, setTree] = useState<FileNode | null>(null);
  const [openedFiles, setOpenedFiles] = useState<string[]>(() =>
    Array.isArray(PREFS.openedFiles) ? PREFS.openedFiles : [],
  );
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("files");
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState | null>(null);

  const {
    theme,
    toggleTheme,
    showSidebar,
    setShowSidebar,
    showOutline,
    setShowOutline,
    viewMode,
    setViewMode,
    sidebarWidth,
    splitRatio,
    persist,
    startSidebarResize,
    startSplitResize,
  } = usePreferences();
  const { modal, modalInputRef, promptText, confirmBox, closeModal, setModal } =
    useModal();

  const contentRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const paneHostRef = useRef<HTMLDivElement>(null);
  const filePathRef = useRef(filePath);

  useEffect(() => {
    filePathRef.current = filePath;
  }, [filePath]);

  const deferredContent = useDeferredValue(content);

  const find = useFind({
    content,
    viewMode,
    setViewMode,
    editorRef,
    contentRef,
    previewScrollRef,
    deferredContent,
  });

  const search = useGlobalSearch({
    sidebarTab,
    tree,
    setError,
  });

  const outline = useOutline({
    deferredContent,
    viewMode,
    previewScrollRef,
    contentRef,
  });

  const { wrapSelection, insertAtCursor } = useEditorMutations(
    content,
    editorRef,
    setContent,
    setDirty,
  );

  const insertLink = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const sel = content.slice(s, e) || L.linkText;
    const snippet = `[${sel}](url)`;
    const text = content.slice(0, s) + snippet + content.slice(e);
    setContent(text);
    setDirty(true);
    const urlStart = s + 1 + sel.length + 2;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(urlStart, urlStart + 3);
    });
  }, [content, L]);

  const handleEditorKeyDown = useEditorKeyDown({
    content,
    setContent,
    setDirty,
    wrapSelection,
    insertLink,
    L,
  });

  useEffect(() => {
    persist({
      lastFolder: tree?.path ?? PREFS.lastFolder ?? "",
      lastFile: filePath || PREFS.lastFile || "",
      openedFiles,
    });
  }, [
    theme,
    viewMode,
    showSidebar,
    showOutline,
    sidebarWidth,
    splitRatio,
    tree,
    filePath,
    openedFiles,
    persist,
  ]);

  useEffect(() => {
    persistLang(lang);
  }, [lang]);

  useLangSync(lang, rebuildMenu);
  useDirtyCloseGuard(dirty, L.confirmCloseUnsaved, confirmBox);

  const loadFile = useCallback(
    async (path: string, jump?: FileJump) => {
      if (dirty && !(await confirmBox(L.confirmSwitchUnsaved))) {
        return false;
      }
      try {
        setError("");
        const text = await readFile(path);
        const name = await getFileName(path);
        setContent(text);
        setFilePath(path);
        setFileName(name || path);
        setDirty(false);
        setOpenedFiles((list) =>
          list.includes(path) ? list : [...list, path],
        );
        if (jump) find.scheduleJump(jump);
        return true;
      } catch (e) {
        setError(String(e));
        return false;
      }
    },
    [dirty, L, confirmBox, find],
  );

  useStartupRestore(
    async (path) => {
      const node = await scanDir(path);
      setTree(node);
    },
    async (path) => {
      const text = await readFile(path);
      const name = await getFileName(path);
      setContent(text);
      setFilePath(path);
      setFileName(name || path);
    },
    PREFS.lastFolder,
    PREFS.lastFile,
  );

  const handleOpenFile = useCallback(async () => {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Markdown", extensions: MD_EXT }],
    });
    if (typeof selected === "string") {
      await loadFile(selected);
      setShowSidebar(true);
    }
  }, [loadFile, setShowSidebar]);

  const handleOpenFolder = useCallback(async () => {
    const selected = await open({ multiple: false, directory: true });
    if (typeof selected === "string") {
      try {
        setError("");
        const node = await scanDir(selected);
        setTree(node);
        setShowSidebar(true);
      } catch (e) {
        setError(String(e));
      }
    }
  }, [setShowSidebar]);

  const refreshTree = useCallback(async () => {
    if (!tree) return;
    try {
      const node = await scanDir(tree.path);
      setTree(node);
    } catch (e) {
      setError(String(e));
    }
  }, [tree]);

  const saveFile = useCallback(async () => {
    try {
      setError("");
      let target = filePath;
      if (!target) {
        const chosen = await save({
          defaultPath: "untitled.md",
          filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
        });
        if (typeof chosen !== "string") return;
        target = chosen;
      }
      await writeFile(target, content);
      const name = await getFileName(target);
      setFilePath(target);
      setFileName(name || target);
      setDirty(false);
    } catch (e) {
      setError(String(e));
    }
  }, [filePath, content]);

  const saveAs = useCallback(async () => {
    try {
      setError("");
      const chosen = await save({
        defaultPath: filePath || L.defaultNewFileName,
        filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
      });
      if (typeof chosen !== "string") return;
      await writeFile(chosen, content);
      const name = await getFileName(chosen);
      setFilePath(chosen);
      setFileName(name || chosen);
      setDirty(false);
    } catch (e) {
      setError(String(e));
    }
  }, [filePath, content, L]);

  const newFile = useCallback(async () => {
    if (dirty && !(await confirmBox(L.confirmSwitchUnsaved))) return;
    setContent("");
    setFilePath("");
    setFileName(L.untitled);
    setDirty(false);
    setError("");
    requestAnimationFrame(() => editorRef.current?.focus());
  }, [dirty, confirmBox, L]);

  const revealCurrent = useCallback(async () => {
    if (!filePath) return;
    try {
      const { revealItemInDir } = await import("@tauri-apps/plugin-opener");
      await revealItemInDir(filePath);
    } catch (e) {
      setError(String(e));
    }
  }, [filePath]);

  const openGlobalSearch = useCallback(() => {
    setShowSidebar(true);
    setSidebarTab("search");
    requestAnimationFrame(() => search.globalInputRef.current?.focus());
  }, [setShowSidebar, search.globalInputRef]);

  const handleMenu = useCallback(
    (id: string) => {
      switch (id) {
        case "new_file":
          void newFile();
          break;
        case "open_file":
          void handleOpenFile();
          break;
        case "open_folder":
          void handleOpenFolder();
          break;
        case "save":
          void saveFile();
          break;
        case "save_as":
          void saveAs();
          break;
        case "reveal":
          void revealCurrent();
          break;
        case "find":
          find.openFind();
          break;
        case "global_search":
          openGlobalSearch();
          break;
        case "view_preview":
          setViewMode("preview");
          break;
        case "view_split":
          setViewMode("split");
          break;
        case "view_source":
          setViewMode("source");
          break;
        case "toggle_sidebar":
          setShowSidebar((v) => !v);
          break;
        case "toggle_outline":
          setShowOutline((v) => !v);
          break;
        case "toggle_theme":
          toggleTheme();
          break;
      }
    },
    [
      newFile,
      handleOpenFile,
      handleOpenFolder,
      saveFile,
      saveAs,
      revealCurrent,
      find,
      openGlobalSearch,
      setViewMode,
      setShowSidebar,
      setShowOutline,
      toggleTheme,
    ],
  );

  useMenuListener(handleMenu);

  useKeyboardShortcuts({
    saveFile: () => void saveFile(),
    openFind: find.openFind,
    openGlobalSearch,
    showFind: find.showFind,
    onCloseFind: () => find.setShowFind(false),
  });

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          if (!IS_TAURI) {
            setError(L.pasteNeedApp);
            return;
          }
          if (!filePathRef.current) {
            setError(L.pasteSaveFirst);
            return;
          }
          const blob = item.getAsFile();
          if (!blob) return;
          try {
            const buf = new Uint8Array(await blob.arrayBuffer());
            const ext = item.type.split("/")[1] || "png";
            const rel = await saveImageBytes(
              Array.from(buf),
              ext,
              filePathRef.current,
            );
            insertAtCursor(`![image](${rel})`);
          } catch (err) {
            setError(String(err));
          }
          return;
        }
      }
    },
    [insertAtCursor, L],
  );

  const handleDropPaths = useCallback(
    async (paths: string[]) => {
      for (const p of paths) {
        const ext = p.split(".").pop()?.toLowerCase() ?? "";
        if (IMAGE_EXT.includes(ext)) {
          try {
            const rel = await importImage(p, filePathRef.current);
            const alt = (rel.split("/").pop() ?? "image").replace(/\.[^.]+$/, "");
            insertAtCursor(`![${alt}](${rel})`);
          } catch (e) {
            setError(String(e));
          }
        } else if (MD_EXT.includes(ext)) {
          await loadFile(p);
        }
      }
    },
    [insertAtCursor, loadFile],
  );

  useDragDrop(handleDropPaths);

  const openContextMenu = useCallback(
    (e: React.MouseEvent, node: FileNode) => {
      e.preventDefault();
      e.stopPropagation();
      setCtxMenu({ x: e.clientX, y: e.clientY, node });
    },
    [],
  );

  useContextMenuDismiss({
    ctxMenu,
    onClose: () => setCtxMenu(null),
  });

  const ctxNewFile = useCallback(async () => {
    if (!ctxMenu) return;
    const node = ctxMenu.node;
    const dir = node.is_dir ? node.path : dirOf(node.path);
    setCtxMenu(null);
    const name = await promptText(L.promptNewFile, L.defaultNewFileName);
    if (!name) return;
    try {
      const path = await createMarkdown(dir, name);
      await refreshTree();
      await loadFile(path);
    } catch (e) {
      setError(String(e));
    }
  }, [ctxMenu, refreshTree, loadFile, L, promptText]);

  const ctxRename = useCallback(async () => {
    if (!ctxMenu) return;
    const node = ctxMenu.node;
    setCtxMenu(null);
    const next = await promptText(L.promptRename, node.name);
    if (!next || next === node.name) return;
    try {
      const newPath = await renamePath(node.path, next);
      await refreshTree();
      setOpenedFiles((list) =>
        list.map((p) => (p === node.path ? newPath : p)),
      );
      if (filePathRef.current === node.path) await loadFile(newPath);
    } catch (e) {
      setError(String(e));
    }
  }, [ctxMenu, refreshTree, loadFile, L, promptText]);

  const ctxDelete = useCallback(async () => {
    if (!ctxMenu) return;
    const node = ctxMenu.node;
    setCtxMenu(null);
    if (!(await confirmBox(L.confirmDelete(node.name), true))) return;
    try {
      await deletePath(node.path);
      await refreshTree();
      setOpenedFiles((list) => list.filter((p) => p !== node.path));
      if (filePathRef.current === node.path) {
        setContent("");
        setFilePath("");
        setFileName(L.untitled);
        setDirty(false);
      }
    } catch (e) {
      setError(String(e));
    }
  }, [ctxMenu, refreshTree, L, confirmBox]);

  const ctxReveal = useCallback(async () => {
    if (!ctxMenu) return;
    const path = ctxMenu.node.path;
    setCtxMenu(null);
    try {
      const { revealItemInDir } = await import("@tauri-apps/plugin-opener");
      await revealItemInDir(path);
    } catch (e) {
      setError(String(e));
    }
  }, [ctxMenu]);

  const handleContentClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      e.preventDefault();
      if (href.startsWith("#")) {
        const id = decodeURIComponent(href.slice(1));
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else if (/^https?:\/\//.test(href)) {
        try {
          const { openUrl } = await import("@tauri-apps/plugin-opener");
          await openUrl(href);
        } catch {
          /* ignore */
        }
      }
    },
    [],
  );

  const stats = useMemo(() => {
    const chars = content.length;
    const lines = content.split("\n").length;
    const cjk = (content.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7a3]/g) || [])
      .length;
    const latin = (content.match(/[A-Za-z0-9_]+/g) || []).length;
    return { chars, lines, words: cjk + latin };
  }, [content]);

  const onEditorChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      setDirty(true);
    },
    [],
  );

  const onSplitResize = startSplitResize(paneHostRef);

  const editor = (
    <EditorPane
      L={L}
      content={content}
      viewMode={viewMode}
      splitRatio={splitRatio}
      showFind={find.showFind}
      findText={find.findText}
      matchIndex={find.matchIndex}
      matchCount={find.matchOffsets.length}
      findInputRef={find.findInputRef}
      editorRef={editorRef}
      onChange={onEditorChange}
      onKeyDown={handleEditorKeyDown}
      onPaste={handlePaste}
      onFindChange={find.setFindText}
      onFindPrev={find.findPrev}
      onFindNext={find.findNext}
      onFindClose={() => find.setShowFind(false)}
    />
  );

  const preview = (
    <MarkdownPreview
      content={deferredContent}
      filePath={filePath}
      viewMode={viewMode}
      splitRatio={splitRatio}
      findText={find.findText}
      matchCount={find.matchOffsets.length}
      contentRef={contentRef}
      previewScrollRef={previewScrollRef}
      onContentClick={handleContentClick}
    />
  );

  return (
    <div className="app">
      <Toolbar
        L={L}
        lang={lang}
        theme={theme}
        viewMode={viewMode}
        showSidebar={showSidebar}
        showOutline={showOutline}
        fileName={fileName}
        filePath={filePath}
        dirty={dirty}
        onToggleSidebar={() => setShowSidebar((v) => !v)}
        onOpenFile={() => void handleOpenFile()}
        onOpenFolder={() => void handleOpenFolder()}
        onSave={() => void saveFile()}
        onFind={find.openFind}
        onViewMode={setViewMode}
        onToggleOutline={() => setShowOutline((v) => !v)}
        onToggleLang={() => setLang(cycleLang(lang))}
        onToggleTheme={toggleTheme}
      />

      <div className="body">
        {showSidebar && (
          <Sidebar
            L={L}
            width={sidebarWidth}
            tab={sidebarTab}
            tree={tree}
            openedFiles={openedFiles}
            filePath={filePath}
            globalQuery={search.globalQuery}
            searchResults={search.searchResults}
            searching={search.searching}
            totalMatches={search.totalMatches}
            globalInputRef={search.globalInputRef}
            onTabChange={setSidebarTab}
            onOpenSearch={openGlobalSearch}
            onLoadFile={(path, jump) => void loadFile(path, jump)}
            onOpenFile={() => void handleOpenFile()}
            onRemoveOpened={(p) =>
              setOpenedFiles((list) => list.filter((x) => x !== p))
            }
            onContextMenu={openContextMenu}
            onGlobalQueryChange={search.setGlobalQuery}
          />
        )}
        {showSidebar && (
          <div
            className="resizer-v"
            onMouseDown={startSidebarResize}
            title={L.dragWidth}
          />
        )}

        <ContentArea
          error={error}
          viewMode={viewMode}
          paneHostRef={paneHostRef}
          editor={editor}
          preview={preview}
          onSplitResize={onSplitResize}
        />

        {showOutline && (
          <OutlinePanel
            L={L}
            headings={outline.headings}
            activeHeading={outline.activeHeading}
            onScrollTo={outline.scrollToHeading}
          />
        )}
      </div>

      <StatusBar
        L={L}
        viewMode={viewMode}
        words={stats.words}
        chars={stats.chars}
        lines={stats.lines}
        dirty={dirty}
        filePath={filePath}
      />

      {ctxMenu && (
        <ContextMenu
          menu={ctxMenu}
          L={L}
          onNewFile={() => void ctxNewFile()}
          onRename={() => void ctxRename()}
          onDelete={() => void ctxDelete()}
          onReveal={() => void ctxReveal()}
        />
      )}

      {modal && (
        <ModalDialog
          modal={modal}
          L={L}
          inputRef={modalInputRef}
          onChangeValue={(value) =>
            setModal((m) => (m ? { ...m, value } : m))
          }
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default App;
