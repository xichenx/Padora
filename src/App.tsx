import {
  Fragment,
  cloneElement,
  useCallback,
  useDeferredValue,
  useEffect,
  isValidElement,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWebview } from "@tauri-apps/api/webview";

import {
  type Lang,
  LANGS,
  STRINGS,
  detectLang,
  persistLang,
  welcomeDoc,
} from "./i18n";

import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import "./App.css";

interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  children: FileNode[];
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface SearchMatch {
  line: number;
  text: string;
}

interface SearchResult {
  name: string;
  path: string;
  matches: SearchMatch[];
}

type ViewMode = "preview" | "split" | "source";

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
const MD_EXT = ["md", "markdown", "mdx"];

// True only inside the Tauri webview; lets the UI still render in a plain
// browser (e.g. `pnpm dev` preview) without crashing on missing Tauri APIs.
const IS_TAURI =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const INITIAL_LANG = detectLang();

/** Directory portion of a file path (no trailing separator). */
function dirOf(p: string): string {
  return p.replace(/[\\/][^\\/]*$/, "");
}

function baseName(p: string): string {
  return p.replace(/^.*[\\/]/, "");
}

/** Split `text` around case-insensitive occurrences of `query`,
 *  wrapping matches in <mark> for the search-result list. */
function highlightText(text: string, query: string) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const out: React.ReactNode[] = [];
  let i = 0;
  let idx = lower.indexOf(q);
  let key = 0;
  while (idx !== -1) {
    if (idx > i) out.push(text.slice(i, idx));
    out.push(<mark key={key++}>{text.slice(idx, idx + query.length)}</mark>);
    i = idx + query.length;
    idx = lower.indexOf(q, i);
  }
  if (i < text.length) out.push(text.slice(i));
  return out;
}

const ICON_PATHS: Record<string, string> = {
  sidebar:
    "M3 4h18v16H3V4zm6 0v16M5 8h2M5 12h2M5 16h2",
  file:
    "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zM14 3v6h6",
  folder:
    "M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z",
  save:
    "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  search:
    "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  list:
    "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  up: "M18 15l-6-6-6 6",
  down: "M6 9l6 6 6-6",
  close: "M18 6L6 18M6 6l12 12",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
  sun:
    "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
};

function Icon({ name, size = 17 }: { name: keyof typeof ICON_PATHS | string; size?: number }) {
  const d = ICON_PATHS[name] ?? "";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d.split("M").filter(Boolean).map((seg, i) => (
        <path key={i} d={`M${seg}`} />
      ))}
    </svg>
  );
}

// Lightweight persisted-settings helpers (localStorage).
const PREF_KEY = "padora.prefs";
function loadPrefs(): Record<string, any> {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  } catch {
    return {};
  }
}
const PREFS = loadPrefs();

function App() {
  const [lang, setLang] = useState<Lang>(INITIAL_LANG);
  const L = STRINGS[lang];
  const [content, setContent] = useState(() => welcomeDoc(INITIAL_LANG));
  const [filePath, setFilePath] = useState("");
  const [fileName, setFileName] = useState(() => STRINGS[INITIAL_LANG].welcomeTitle);
  const [tree, setTree] = useState<FileNode | null>(null);
  // Typora-style "Files" panel: a flat list of files the user has opened
  // (most recent last), rather than the whole folder tree.
  const [openedFiles, setOpenedFiles] = useState<string[]>(() =>
    Array.isArray(PREFS.openedFiles) ? PREFS.openedFiles : [],
  );
  const [theme, setTheme] = useState<"light" | "dark">(
    PREFS.theme === "dark" ? "dark" : "light",
  );
  const [showSidebar, setShowSidebar] = useState(PREFS.showSidebar !== false);
  const [showOutline, setShowOutline] = useState(PREFS.showOutline === true);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeading, setActiveHeading] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>(
    PREFS.viewMode === "split" || PREFS.viewMode === "source"
      ? PREFS.viewMode
      : "preview",
  );
  const [dirty, setDirty] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(
    typeof PREFS.sidebarWidth === "number" ? PREFS.sidebarWidth : 250,
  );
  const [splitRatio, setSplitRatio] = useState<number>(
    typeof PREFS.splitRatio === "number" ? PREFS.splitRatio : 0.5,
  );

  // In-file find bar state.
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState("");
  const [matchIndex, setMatchIndex] = useState(-1);

  // Sidebar tabs + global (cross-file) search state.
  const [sidebarTab, setSidebarTab] = useState<"files" | "search">("files");
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  // A pending jump (line + query) applied after a file finishes loading.
  const pendingJumpRef = useRef<{ line: number; query: string } | null>(null);
  // Incremented on every search-result click so the jump re-applies even when
  // the query (and thus findText) is unchanged.
  const [jumpNonce, setJumpNonce] = useState(0);

  // File-tree right-click context menu.
  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    node: FileNode;
  } | null>(null);

  // In-app modal dialog (replaces window.prompt/confirm, which are unreliable
  // inside the Tauri webview). `prompt` shows a text field; `confirm` only OK.
  const [modal, setModal] = useState<{
    kind: "prompt" | "confirm";
    message: string;
    value: string;
    danger?: boolean;
  } | null>(null);
  const modalResolveRef = useRef<((v: string | boolean | null) => void) | null>(
    null,
  );
  const modalInputRef = useRef<HTMLInputElement>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const findInputRef = useRef<HTMLInputElement>(null);
  const globalInputRef = useRef<HTMLInputElement>(null);

  // Refs mirroring state so stable callbacks can read fresh values.
  const filePathRef = useRef(filePath);
  useEffect(() => {
    filePathRef.current = filePath;
  }, [filePath]);

  const dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);


  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Defer markdown parsing so fast typing stays responsive on big documents.
  const deferredContent = useDeferredValue(content);

  // Persist UI preferences whenever they change.
  useEffect(() => {
    const prefs = {
      theme,
      viewMode,
      showSidebar,
      showOutline,
      sidebarWidth,
      splitRatio,
      lastFolder: tree?.path ?? PREFS.lastFolder ?? "",
      lastFile: filePath || PREFS.lastFile || "",
      openedFiles,
    };
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore quota errors */
    }
  }, [theme, viewMode, showSidebar, showOutline, sidebarWidth, splitRatio, tree, filePath, openedFiles]);

  // Persist the language and rebuild the native menu in the chosen language.
  useEffect(() => {
    persistLang(lang);
    document.documentElement.setAttribute("lang", lang);
    if (IS_TAURI) {
      invoke("rebuild_menu", { lang }).catch(() => {
        /* menu rebuild is best-effort */
      });
    }
  }, [lang]);

  // Tag the root with the OS so the toolbar can reserve space for the
  // macOS traffic-light controls under the overlay title bar.
  useEffect(() => {
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    document.documentElement.setAttribute("data-os", isMac ? "mac" : "other");
  }, []);

  // Guard against closing the window with unsaved changes.
  useEffect(() => {
    if (!IS_TAURI) return;
    let unlisten: (() => void) | undefined;
    import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => {
        const win = getCurrentWindow();
        return win.onCloseRequested(async (event) => {
          if (!dirtyRef.current) return;
          // Block the default close, ask via the in-app modal, then destroy
          // the window manually if the user confirms.
          event.preventDefault();
          const ok = await confirmBox(
            STRINGS[langRef.current].confirmCloseUnsaved,
            true,
          );
          if (ok) {
            dirtyRef.current = false;
            void win.destroy();
          }
        });
      })
      .then((u) => {
        unlisten = u;
      })
      .catch(() => {
        /* window API unavailable */
      });
    return () => {
      unlisten?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore the last opened folder + file on startup (Tauri only).
  useEffect(() => {
    if (!IS_TAURI) return;
    (async () => {
      try {
        if (PREFS.lastFolder) {
          const node = await invoke<FileNode>("scan_dir", {
            path: PREFS.lastFolder,
          });
          setTree(node);
        }
      } catch {
        /* folder may have moved */
      }
      try {
        if (PREFS.lastFile) {
          const text = await invoke<string>("read_file", {
            path: PREFS.lastFile,
          });
          const name = await invoke<string>("file_name", {
            path: PREFS.lastFile,
          });
          setContent(text);
          setFilePath(PREFS.lastFile);
          setFileName(name || PREFS.lastFile);
        }
      } catch {
        /* file may have moved */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show a text-input dialog; resolves to the entered string or null.
  const promptText = useCallback(
    (message: string, value = ""): Promise<string | null> =>
      new Promise((resolve) => {
        modalResolveRef.current = resolve as (v: string | boolean | null) => void;
        setModal({ kind: "prompt", message, value });
      }),
    [],
  );

  // Show a confirmation dialog; resolves to true (OK) or false (Cancel).
  const confirmBox = useCallback(
    (message: string, danger = false): Promise<boolean> =>
      new Promise((resolve) => {
        modalResolveRef.current = resolve as (v: string | boolean | null) => void;
        setModal({ kind: "confirm", message, value: "", danger });
      }),
    [],
  );

  const closeModal = useCallback((result: string | boolean | null) => {
    const resolve = modalResolveRef.current;
    modalResolveRef.current = null;
    setModal(null);
    resolve?.(result);
  }, []);

  const loadFile = useCallback(
    async (path: string, jump?: { line: number; query: string }) => {
      if (dirty && !(await confirmBox(L.confirmSwitchUnsaved))) {
        return false;
      }
      try {
        setError("");
        const text = await invoke<string>("read_file", { path });
        const name = await invoke<string>("file_name", { path });
        setContent(text);
        setFilePath(path);
        setFileName(name || path);
        setDirty(false);
        setOpenedFiles((list) =>
          list.includes(path) ? list : [...list, path],
        );
        if (jump) {
          pendingJumpRef.current = jump;
          setViewMode((m) => (m === "preview" ? "split" : m));
          if (jump.query) {
            setFindText(jump.query);
            setShowFind(true);
          }
          // Bump a nonce so the jump runs even when the query is unchanged.
          setJumpNonce((n) => n + 1);
        }
        return true;
      } catch (e) {
        setError(String(e));
        return false;
      }
    },
    [dirty, L, confirmBox],
  );

  const handleOpenFile = useCallback(async () => {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Markdown", extensions: MD_EXT }],
    });
    if (typeof selected === "string") {
      // The opened file is added to the Files list inside loadFile.
      await loadFile(selected);
      setShowSidebar(true);
    }
  }, [loadFile]);

  const handleOpenFolder = useCallback(async () => {
    const selected = await open({ multiple: false, directory: true });
    if (typeof selected === "string") {
      try {
        setError("");
        const node = await invoke<FileNode>("scan_dir", { path: selected });
        setTree(node);
        setShowSidebar(true);
      } catch (e) {
        setError(String(e));
      }
    }
  }, []);

  // Re-scan the opened folder to refresh the file tree.
  const refreshTree = useCallback(async () => {
    if (!tree) return;
    try {
      const node = await invoke<FileNode>("scan_dir", { path: tree.path });
      setTree(node);
    } catch (e) {
      setError(String(e));
    }
  }, [tree]);

  const openContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  // Close the context menu on any global click / escape. The listeners are
  // attached on the next tick so the trailing click/contextmenu event from the
  // right-click that *opened* the menu doesn't immediately close it.
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCtxMenu(null);
    };
    const id = window.setTimeout(() => {
      window.addEventListener("click", close);
      window.addEventListener("contextmenu", close);
      window.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [ctxMenu]);

  const ctxNewFile = useCallback(async () => {
    if (!ctxMenu) return;
    const node = ctxMenu.node;
    const dir = node.is_dir ? node.path : dirOf(node.path);
    setCtxMenu(null);
    const name = await promptText(L.promptNewFile, L.defaultNewFileName);
    if (!name) return;
    try {
      const path = await invoke<string>("create_markdown", { dir, name });
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
      const newPath = await invoke<string>("rename_path", {
        path: node.path,
        newName: next,
      });
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
      await invoke("delete_path", { path: node.path });
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

  // Remove a file from the opened list without deleting it from disk.
  const removeOpened = useCallback((path: string) => {
    setOpenedFiles((list) => list.filter((p) => p !== path));
  }, []);

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
      await invoke("write_file", { path: target, content });
      const name = await invoke<string>("file_name", { path: target });
      setFilePath(target);
      setFileName(name || target);
      setDirty(false);
    } catch (e) {
      setError(String(e));
    }
  }, [filePath, content]);

  // Save the current content to a new location chosen by the user.
  const saveAs = useCallback(async () => {
    try {
      setError("");
      const chosen = await save({
        defaultPath: filePath || L.defaultNewFileName,
        filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
      });
      if (typeof chosen !== "string") return;
      await invoke("write_file", { path: chosen, content });
      const name = await invoke<string>("file_name", { path: chosen });
      setFilePath(chosen);
      setFileName(name || chosen);
      setDirty(false);
    } catch (e) {
      setError(String(e));
    }
  }, [filePath, content, L]);

  // Start a fresh, unsaved document (like Cursor's "New Text File").
  const newFile = useCallback(async () => {
    if (dirty && !(await confirmBox(L.confirmSwitchUnsaved))) return;
    setContent("");
    setFilePath("");
    setFileName(L.untitled);
    setDirty(false);
    setError("");
    requestAnimationFrame(() => editorRef.current?.focus());
  }, [dirty, confirmBox, L]);

  // Reveal the current file in the OS file manager.
  const revealCurrent = useCallback(async () => {
    if (!filePath) return;
    try {
      const { revealItemInDir } = await import("@tauri-apps/plugin-opener");
      await revealItemInDir(filePath);
    } catch (e) {
      setError(String(e));
    }
  }, [filePath]);

  // Insert text at the textarea cursor (or append when not mounted).
  const insertAtCursor = useCallback((text: string) => {
    const el = editorRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      setContent((c) => c.slice(0, start) + text + c.slice(end));
      setDirty(true);
      requestAnimationFrame(() => {
        el.focus();
        el.selectionStart = el.selectionEnd = start + text.length;
      });
    } else {
      setContent((c) => `${c}${c.endsWith("\n") ? "" : "\n"}${text}\n`);
      setDirty(true);
    }
  }, []);

  // Paste an image from the clipboard into assets/ and insert a reference.
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
            const rel = await invoke<string>("save_image_bytes", {
              data: Array.from(buf),
              ext,
              mdPath: filePathRef.current,
            });
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

  // Handle OS files dropped onto the window: import images, open markdown.
  const handleDropPaths = useCallback(
    async (paths: string[]) => {
      for (const p of paths) {
        const ext = p.split(".").pop()?.toLowerCase() ?? "";
        if (IMAGE_EXT.includes(ext)) {
          try {
            const rel = await invoke<string>("import_image", {
              src: p,
              mdPath: filePathRef.current,
            });
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

  useEffect(() => {
    if (!IS_TAURI) return;
    let unlisten: (() => void) | undefined;
    try {
      getCurrentWebview()
        .onDragDropEvent((event) => {
          const payload = event.payload as { type: string; paths?: string[] };
          if (payload.type === "drop" && Array.isArray(payload.paths)) {
            void handleDropPaths(payload.paths);
          }
        })
        .then((u) => {
          unlisten = u;
        })
        .catch(() => {
          /* drag-drop unavailable outside Tauri */
        });
    } catch {
      /* not running inside Tauri */
    }
    return () => {
      unlisten?.();
    };
  }, [handleDropPaths]);

  const openFind = useCallback(() => {
    if (viewMode === "preview") setViewMode("split");
    setShowFind(true);
    requestAnimationFrame(() => findInputRef.current?.focus());
  }, [viewMode]);

  // Open the sidebar's global-search tab.
  const openGlobalSearch = useCallback(() => {
    setShowSidebar(true);
    setSidebarTab("search");
    requestAnimationFrame(() => globalInputRef.current?.focus());
  }, []);

  // Dispatch native menu actions (forwarded from the Rust "menu" event).
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
          openFind();
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
          setTheme((t) => (t === "light" ? "dark" : "light"));
          break;
      }
    },
    [
      handleOpenFile,
      handleOpenFolder,
      saveFile,
      saveAs,
      newFile,
      revealCurrent,
      openFind,
      openGlobalSearch,
    ],
  );

  // Keep a stable ref so the menu listener (registered once) calls fresh logic.
  const handleMenuRef = useRef(handleMenu);
  useEffect(() => {
    handleMenuRef.current = handleMenu;
  }, [handleMenu]);

  useEffect(() => {
    if (!IS_TAURI) return;
    let unlisten: (() => void) | undefined;
    import("@tauri-apps/api/event")
      .then(({ listen }) =>
        listen<string>("menu", (e) => handleMenuRef.current(e.payload)),
      )
      .then((u) => {
        unlisten = u;
      })
      .catch(() => {
        /* events unavailable outside Tauri */
      });
    return () => {
      unlisten?.();
    };
  }, []);

  // Debounced cross-file search across the opened folder.
  useEffect(() => {
    if (sidebarTab !== "search") return;
    const q = globalQuery.trim();
    if (!q || !tree) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const id = window.setTimeout(async () => {
      try {
        const res = await invoke<SearchResult[]>("search_dir", {
          root: tree.path,
          query: q,
        });
        setSearchResults(res);
      } catch (e) {
        setError(String(e));
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(id);
  }, [globalQuery, sidebarTab, tree]);

  const totalMatches = useMemo(
    () => searchResults.reduce((sum, r) => sum + r.matches.length, 0),
    [searchResults],
  );

  // Global shortcuts: Cmd/Ctrl+S save, Cmd/Ctrl+F find.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveFile();
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        openGlobalSearch();
      } else if (mod && e.key.toLowerCase() === "f") {
        e.preventDefault();
        openFind();
      } else if (e.key === "Escape" && showFind) {
        setShowFind(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveFile, openFind, openGlobalSearch, showFind]);

  // All match offsets in the current file (case-insensitive).
  const matchOffsets = useMemo(() => {
    if (!findText) return [];
    const offsets: number[] = [];
    const hay = content.toLowerCase();
    const needle = findText.toLowerCase();
    let from = 0;
    let idx = hay.indexOf(needle, from);
    while (idx !== -1) {
      offsets.push(idx);
      from = idx + needle.length;
      idx = hay.indexOf(needle, from);
    }
    return offsets;
  }, [content, findText]);

  // Select the match at a given index and scroll it into view.
  const selectMatch = useCallback(
    (i: number) => {
      const el = editorRef.current;
      if (!el || matchOffsets.length === 0) return;
      const idx = ((i % matchOffsets.length) + matchOffsets.length) %
        matchOffsets.length;
      const start = matchOffsets[idx];
      setMatchIndex(idx);
      // Set the selection on the editor, but keep focus in the find input so
      // repeated Enter presses keep cycling through matches instead of typing
      // into the editor.
      el.setSelectionRange(start, start + findText.length);
      const before = content.slice(0, start).split("\n").length - 1;
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 24;
      el.scrollTop = Math.max(0, before * lh - el.clientHeight / 2);
      findInputRef.current?.focus();
    },
    [matchOffsets, findText, content],
  );

  const findNext = useCallback(
    () => selectMatch(matchIndex + 1),
    [selectMatch, matchIndex],
  );
  const findPrev = useCallback(
    () => selectMatch(matchIndex - 1),
    [selectMatch, matchIndex],
  );

  // Reset / re-anchor the current match whenever the term changes.
  useEffect(() => {
    if (!showFind || matchOffsets.length === 0) {
      setMatchIndex(-1);
      return;
    }
    // A pending jump targets a specific occurrence; let the jump effect place
    // the cursor instead of snapping back to the first match.
    if (pendingJumpRef.current) return;
    setMatchIndex(0);
    const el = editorRef.current;
    if (el) {
      const start = matchOffsets[0];
      requestAnimationFrame(() => {
        el.setSelectionRange(start, start + findText.length);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findText, showFind]);

  // Apply a pending jump from global search: land on the occurrence at the
  // clicked line (not the first match in the file). Retries until the editor
  // textarea has mounted (e.g. when switching out of preview-only mode).
  useEffect(() => {
    const jump = pendingJumpRef.current;
    if (!jump) return;

    let tries = 0;
    let raf = 0;
    const run = () => {
      const el = editorRef.current;
      if (!el || matchOffsets.length === 0) {
        if (tries++ < 20) {
          raf = requestAnimationFrame(run);
        }
        return;
      }
      const lines = content.split("\n");
      let lineStart = 0;
      for (let i = 0; i < jump.line - 1 && i < lines.length; i++) {
        lineStart += lines[i].length + 1;
      }
      const lineEnd = lineStart + (lines[jump.line - 1]?.length ?? 0);

      let idx = matchOffsets.findIndex(
        (o) => o >= lineStart && o <= lineEnd,
      );
      if (idx < 0) idx = matchOffsets.findIndex((o) => o >= lineStart);
      if (idx < 0) idx = 0;

      pendingJumpRef.current = null;
      selectMatch(idx);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpNonce]);

  // Typora-style: mark the active hit in the preview with a stronger highlight
  // and scroll it to the vertical center. All hits keep the soft highlight.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const marks = root.querySelectorAll<HTMLElement>("mark.find-highlight");
    marks.forEach((m) => m.classList.remove("current"));
    if (!showFind || matchIndex < 0 || matchIndex >= marks.length) return;

    const current = marks[matchIndex];
    current.classList.add("current");
    const scroller = previewScrollRef.current;
    if (!scroller) return;
    requestAnimationFrame(() => {
      const sRect = scroller.getBoundingClientRect();
      const mRect = current.getBoundingClientRect();
      const delta = mRect.top - sRect.top - scroller.clientHeight / 2;
      scroller.scrollTop += delta;
    });
  }, [matchIndex, deferredContent, showFind, findText]);

  // Extract the outline (TOC) from the rendered DOM after content changes.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const id = window.setTimeout(() => {
      const nodes = el.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const list: Heading[] = [];
      nodes.forEach((n) => {
        const h = n as HTMLElement;
        if (!h.id) return;
        list.push({
          id: h.id,
          text: h.textContent || "",
          level: Number(h.tagName.substring(1)),
        });
      });
      setHeadings(list);
    }, 60);
    return () => window.clearTimeout(id);
  }, [deferredContent, viewMode]);

  // Highlight the heading nearest the top of the viewport while scrolling.
  useEffect(() => {
    const scroller = previewScrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content || headings.length === 0) return;
    const onScroll = () => {
      const hs = content.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const top = scroller.getBoundingClientRect().top;
      let current = "";
      hs.forEach((n) => {
        const h = n as HTMLElement;
        if (h.id && h.getBoundingClientRect().top - top <= 80) current = h.id;
      });
      setActiveHeading(current);
    };
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [headings, viewMode]);

  // Intercept link clicks: internal anchors scroll, others open externally.
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

  const scrollToHeading = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const paneHostRef = useRef<HTMLDivElement>(null);

  // Drag handle between the sidebar and the content area.
  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const aside = document.querySelector(".sidebar") as HTMLElement | null;
    const startW = aside ? aside.offsetWidth : 250;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev: MouseEvent) => {
      const w = Math.min(480, Math.max(170, startW + ev.clientX - startX));
      setSidebarWidth(w);
    };
    const onUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  // Drag handle between the editor and preview panes (split mode).
  const startSplitResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev: MouseEvent) => {
      const host = paneHostRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const ratio = (ev.clientX - rect.left) / rect.width;
      setSplitRatio(Math.min(0.8, Math.max(0.2, ratio)));
    };
    const onUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  // Apply an edit defined as a pure transform of (content, selStart, selEnd),
  // then restore focus and the returned selection range.
  const applyEdit = useCallback(
    (
      mutate: (
        c: string,
        s: number,
        e: number,
      ) => { text: string; selStart: number; selEnd: number },
    ) => {
      const el = editorRef.current;
      if (!el) return;
      const { text, selStart, selEnd } = mutate(
        content,
        el.selectionStart,
        el.selectionEnd,
      );
      setContent(text);
      setDirty(true);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(selStart, selEnd);
      });
    },
    [content],
  );

  // Wrap the current selection with `marker` on both sides (bold/italic/code).
  const wrapSelection = useCallback(
    (marker: string, placeholder = "") => {
      applyEdit((c, s, e) => {
        const sel = c.slice(s, e) || placeholder;
        const text = c.slice(0, s) + marker + sel + marker + c.slice(e);
        return {
          text,
          selStart: s + marker.length,
          selEnd: s + marker.length + sel.length,
        };
      });
    },
    [applyEdit],
  );

  const insertLink = useCallback(() => {
    applyEdit((c, s, e) => {
      const sel = c.slice(s, e) || L.linkText;
      const snippet = `[${sel}](url)`;
      const text = c.slice(0, s) + snippet + c.slice(e);
      const urlStart = s + 1 + sel.length + 2;
      return { text, selStart: urlStart, selEnd: urlStart + 3 };
    });
  }, [applyEdit, L]);

  // Pairs that wrap the selection when typed while text is selected.
  const WRAP_PAIRS: Record<string, string> = {
    "*": "*",
    "`": "`",
    "_": "_",
    "(": ")",
    "[": "]",
    '"': '"',
    "“": "”",
    "（": "）",
  };

  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      const mod = e.metaKey || e.ctrlKey;
      const start = el.selectionStart;
      const end = el.selectionEnd;

      // Typora-style formatting shortcuts.
      if (mod && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "b") {
          e.preventDefault();
          wrapSelection("**", L.bold);
          return;
        }
        if (key === "i") {
          e.preventDefault();
          wrapSelection("*", L.italic);
          return;
        }
        if (key === "e") {
          e.preventDefault();
          wrapSelection("`", L.code);
          return;
        }
        if (key === "k") {
          e.preventDefault();
          insertLink();
          return;
        }
      }

      // Tab inserts two spaces.
      if (e.key === "Tab") {
        e.preventDefault();
        const next = content.slice(0, start) + "  " + content.slice(end);
        setContent(next);
        setDirty(true);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 2;
        });
        return;
      }

      // Wrap selection when typing a pairing character.
      if (!mod && start !== end && e.key in WRAP_PAIRS) {
        e.preventDefault();
        const open = e.key;
        const close = WRAP_PAIRS[e.key];
        const sel = content.slice(start, end);
        const text =
          content.slice(0, start) + open + sel + close + content.slice(end);
        setContent(text);
        setDirty(true);
        requestAnimationFrame(() => {
          el.setSelectionRange(start + 1, end + 1);
        });
        return;
      }

      // List / quote continuation on Enter.
      if (e.key === "Enter" && !e.shiftKey && start === end) {
        const lineStart = content.lastIndexOf("\n", start - 1) + 1;
        const line = content.slice(lineStart, start);
        const m = line.match(/^(\s*)([-*+]\s\[[ xX]\]\s|[-*+]\s|\d+\.\s|>\s?)/);
        if (m) {
          const indent = m[1];
          let marker = m[2];
          const rest = line.slice(m[0].length);
          // Empty item: exit the list/quote instead of continuing.
          if (rest.trim() === "") {
            e.preventDefault();
            const text = content.slice(0, lineStart) + content.slice(start);
            setContent(text);
            setDirty(true);
            requestAnimationFrame(() => {
              el.setSelectionRange(lineStart, lineStart);
            });
            return;
          }
          e.preventDefault();
          const ordered = marker.match(/^(\d+)\.\s$/);
          if (ordered) marker = `${Number(ordered[1]) + 1}. `;
          marker = marker.replace(/\[[xX]\]/, "[ ]");
          const insert = "\n" + indent + marker;
          const text = content.slice(0, start) + insert + content.slice(start);
          setContent(text);
          setDirty(true);
          const pos = start + insert.length;
          requestAnimationFrame(() => {
            el.setSelectionRange(pos, pos);
          });
        }
      }
    },
    [content, wrapSelection, insertLink, L],
  );

  // Document statistics for the status bar (CJK-aware word count).
  const stats = useMemo(() => {
    const chars = content.length;
    const lines = content.split("\n").length;
    const cjk = (content.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7a3]/g) || [])
      .length;
    const latin = (content.match(/[A-Za-z0-9_]+/g) || []).length;
    return { chars, lines, words: cjk + latin };
  }, [content]);

  const VIEW_LABEL: Record<ViewMode, string> = {
    preview: L.viewPreview,
    split: L.viewSplit,
    source: L.viewSource,
  };

  const onEditorChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      setDirty(true);
    },
    [],
  );

  // Resolve image src so local/relative paths render via the asset protocol.
  const resolveImg = useCallback(
    (src?: string): string => {
      if (!src) return "";
      if (/^(https?:|data:|asset:|blob:)/.test(src)) return src;
      const isAbs = src.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(src);
      const base = filePath ? dirOf(filePath) : "";
      const abs = isAbs ? src : base ? `${base}/${src}` : src;
      try {
        return convertFileSrc(abs);
      } catch {
        return src;
      }
    },
    [filePath],
  );

  const renderFindHighlights = useCallback(
    (value: string) => {
      const needle = findText.trim();
      if (!needle || matchOffsets.length === 0) return value;

      const lowerValue = value.toLowerCase();
      const lowerNeedle = needle.toLowerCase();
      const parts: any[] = [];
      let from = 0;
      let idx = lowerValue.indexOf(lowerNeedle, from);

      while (idx !== -1) {
        if (idx > from) parts.push(value.slice(from, idx));
        parts.push(
          <mark className="find-highlight" key={`${idx}-${parts.length}`}>
            {value.slice(idx, idx + needle.length)}
          </mark>,
        );
        from = idx + needle.length;
        idx = lowerValue.indexOf(lowerNeedle, from);
      }

      if (from < value.length) parts.push(value.slice(from));
      return parts.length > 0 ? parts : value;
    },
    [findText, matchOffsets.length],
  );

  const highlightFindChildren = useCallback(
    (children: any): any => {
      if (!findText.trim() || matchOffsets.length === 0) return children;
      if (typeof children === "string") return renderFindHighlights(children);
      if (Array.isArray(children)) {
        return children.map((child, index) => (
          <Fragment key={index}>{highlightFindChildren(child)}</Fragment>
        ));
      }
      if (isValidElement(children)) {
        const props = children.props as { children?: any };
        if (props.children == null) return children;
        return cloneElement(
          children as any,
          undefined,
          highlightFindChildren(props.children),
        );
      }
      return children;
    },
    [findText, matchOffsets.length, renderFindHighlights],
  );

  const markdownComponents = useMemo(
    () => ({
      a: ({ node: _n, children, ...props }: any) => (
        <a {...props}>{highlightFindChildren(children)}</a>
      ),
      p: ({ node: _n, children, ...props }: any) => (
        <p {...props}>{highlightFindChildren(children)}</p>
      ),
      li: ({ node: _n, children, ...props }: any) => (
        <li {...props}>{highlightFindChildren(children)}</li>
      ),
      h1: ({ node: _n, children, ...props }: any) => (
        <h1 {...props}>{highlightFindChildren(children)}</h1>
      ),
      h2: ({ node: _n, children, ...props }: any) => (
        <h2 {...props}>{highlightFindChildren(children)}</h2>
      ),
      h3: ({ node: _n, children, ...props }: any) => (
        <h3 {...props}>{highlightFindChildren(children)}</h3>
      ),
      h4: ({ node: _n, children, ...props }: any) => (
        <h4 {...props}>{highlightFindChildren(children)}</h4>
      ),
      h5: ({ node: _n, children, ...props }: any) => (
        <h5 {...props}>{highlightFindChildren(children)}</h5>
      ),
      h6: ({ node: _n, children, ...props }: any) => (
        <h6 {...props}>{highlightFindChildren(children)}</h6>
      ),
      td: ({ node: _n, children, ...props }: any) => (
        <td {...props}>{highlightFindChildren(children)}</td>
      ),
      th: ({ node: _n, children, ...props }: any) => (
        <th {...props}>{highlightFindChildren(children)}</th>
      ),
      blockquote: ({ node: _n, children, ...props }: any) => (
        <blockquote {...props}>{highlightFindChildren(children)}</blockquote>
      ),
      img: ({ node: _n, src, ...props }: any) => (
        <img src={resolveImg(src)} {...props} />
      ),
    }),
    [resolveImg, highlightFindChildren],
  );

  const preview = (
    <div
      className="pane preview-pane"
      ref={previewScrollRef}
      onClick={handleContentClick}
      style={
        viewMode === "split"
          ? { flex: `1 1 ${(1 - splitRatio) * 100}%` }
          : undefined
      }
    >
      <div className="content markdown-body" ref={contentRef}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            rehypeRaw,
            rehypeSlug,
            rehypeKatex,
            [rehypeHighlight, { ignoreMissing: true }],
          ]}
          components={markdownComponents}
        >
          {deferredContent}
        </ReactMarkdown>
      </div>
    </div>
  );

  const editor = (
    <div
      className="pane editor-pane"
      style={
        viewMode === "split"
          ? { flex: `0 0 ${splitRatio * 100}%` }
          : undefined
      }
    >
      {showFind && (
        <div className="find-bar">
          <div className="find-field">
            <input
              ref={findInputRef}
              className="find-input"
              placeholder={L.findInFile}
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (e.shiftKey) findPrev();
                  else findNext();
                }
              }}
            />
            <span className="find-count">
              {findText ? `${matchIndex >= 0 ? matchIndex + 1 : 0}/${matchOffsets.length}` : ""}
            </span>
          </div>
          <button
            className="find-icon"
            onClick={findPrev}
            disabled={matchOffsets.length === 0}
            title={L.findPrev}
          >
            <Icon name="up" size={15} />
          </button>
          <button
            className="find-icon"
            onClick={findNext}
            disabled={matchOffsets.length === 0}
            title={L.findNext}
          >
            <Icon name="down" size={15} />
          </button>
          <button
            className="find-icon"
            onClick={() => setShowFind(false)}
            title={L.findClose}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      <textarea
        ref={editorRef}
        className="editor"
        value={content}
        spellCheck={false}
        onChange={onEditorChange}
        onKeyDown={handleEditorKeyDown}
        onPaste={handlePaste}
        placeholder={L.editorPlaceholder}
      />
    </div>
  );

  return (
    <div className="app">
      <header className="toolbar" data-tauri-drag-region>
        <div className="toolbar-left">
          <button
            className={`icon-btn ${showSidebar ? "active" : ""}`}
            onClick={() => setShowSidebar((v) => !v)}
            title={L.fileTree}
          >
            <Icon name="sidebar" />
          </button>
          <span className="tb-sep" />
          <button className="icon-btn" onClick={handleOpenFile} title={L.openFile}>
            <Icon name="file" />
          </button>
          <button className="icon-btn" onClick={handleOpenFolder} title={L.openFolder}>
            <Icon name="folder" />
          </button>
          <button
            className="icon-btn"
            onClick={() => void saveFile()}
            title={L.save}
          >
            <Icon name="save" />
          </button>
          <button className="icon-btn" onClick={openFind} title={L.find}>
            <Icon name="search" />
          </button>
        </div>

        <div className="toolbar-title" title={filePath} data-tauri-drag-region>
          {dirty && <span className="dirty-dot" />}
          <span className="title-text">{fileName}</span>
        </div>

        <div className="toolbar-right">
          <div className="view-switch">
            <button
              className={`seg ${viewMode === "preview" ? "active" : ""}`}
              onClick={() => setViewMode("preview")}
            >
              {L.viewPreview}
            </button>
            <button
              className={`seg ${viewMode === "split" ? "active" : ""}`}
              onClick={() => setViewMode("split")}
            >
              {L.viewSplit}
            </button>
            <button
              className={`seg ${viewMode === "source" ? "active" : ""}`}
              onClick={() => setViewMode("source")}
            >
              {L.viewSource}
            </button>
          </div>
          <span className="tb-sep" />
          <button
            className={`icon-btn ${showOutline ? "active" : ""}`}
            onClick={() => setShowOutline((v) => !v)}
            title={L.outline}
          >
            <Icon name="list" />
          </button>
          <button
            className="icon-btn lang-btn"
            onClick={() =>
              setLang((cur) => {
                const i = LANGS.findIndex((x) => x.id === cur);
                return LANGS[(i + 1) % LANGS.length].id;
              })
            }
            title={L.switchLang}
          >
            {lang === "zh" ? "中" : "EN"}
          </button>
          <button
            className="icon-btn"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            title={L.toggleTheme}
          >
            <Icon name={theme === "light" ? "moon" : "sun"} />
          </button>
        </div>
      </header>

      <div className="body">
        {showSidebar && (
          <aside className="sidebar" style={{ width: sidebarWidth }}>
            <div className="sidebar-tabs">
              <button
                className={`sb-tab ${sidebarTab === "files" ? "active" : ""}`}
                onClick={() => setSidebarTab("files")}
              >
                {L.tabFiles}
              </button>
              <button
                className={`sb-tab ${sidebarTab === "search" ? "active" : ""}`}
                onClick={openGlobalSearch}
              >
                {L.tabSearch}
              </button>
            </div>

            {sidebarTab === "files" ? (
              <div className="sidebar-body">
                {openedFiles.length > 0 ? (
                  <div className="opened-list">
                    {openedFiles.map((p) => (
                      <div
                        key={p}
                        className={`opened-item ${p === filePath ? "active" : ""}`}
                        title={p}
                        onClick={() => void loadFile(p)}
                        onContextMenu={(e) =>
                          openContextMenu(e, {
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
                            removeOpened(p);
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
                    <button className="tb-btn" onClick={handleOpenFile}>
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
                    placeholder={tree ? L.searchPlaceholder : L.searchPlaceholderNoFolder}
                    value={globalQuery}
                    disabled={!tree}
                    onChange={(e) => setGlobalQuery(e.target.value)}
                  />
                  {globalQuery && (
                    <button
                      className="search-clear"
                      onClick={() => setGlobalQuery("")}
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
                          loadFile(r.path, {
                            line: r.matches[0].line,
                            query: globalQuery.trim(),
                          })
                        }
                      >
                        <span className="tree-icon">📄</span>
                        <span className="tree-label">{r.name}</span>
                        <span className="search-file-count">
                          {r.matches.length}
                        </span>
                      </div>
                      {r.matches.map((m, i) => (
                        <div
                          key={`${r.path}-${m.line}-${i}`}
                          className="search-line"
                          title={m.text}
                          onClick={() =>
                            loadFile(r.path, {
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
        )}
        {showSidebar && (
          <div
            className="resizer-v"
            onMouseDown={startSidebarResize}
            title={L.dragWidth}
          />
        )}

        <main className="content-wrap">
          {error && <div className="error-bar">{error}</div>}
          <div className={`pane-host mode-${viewMode}`} ref={paneHostRef}>
            {viewMode === "source" && editor}
            {viewMode === "split" && (
              <>
                {editor}
                <div className="resizer-v" onMouseDown={startSplitResize} />
                {preview}
              </>
            )}
            {viewMode === "preview" && preview}
          </div>
        </main>

        {showOutline && (
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
                  onClick={() => scrollToHeading(h.id)}
                  title={h.text}
                >
                  {h.text}
                </div>
              ))
            )}
          </aside>
        )}
      </div>

      <footer className="statusbar">
        <div className="status-left">
          <span className="status-mode">{VIEW_LABEL[viewMode]}</span>
          <span className="status-sep" />
          <span>{L.words(stats.words)}</span>
          <span>{L.chars(stats.chars)}</span>
          <span>{L.lines(stats.lines)}</span>
        </div>
        <div className="status-right">
          {dirty ? L.unsaved : filePath ? L.saved : L.newDoc}
        </div>
      </footer>

      {ctxMenu && (
        <div
          className="ctx-menu"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="ctx-item" onClick={ctxNewFile}>
            {L.ctxNewFile}
          </button>
          <button className="ctx-item" onClick={ctxRename}>
            {L.ctxRename}
          </button>
          <button className="ctx-item danger" onClick={ctxDelete}>
            {L.ctxDelete}
          </button>
          <div className="ctx-sep" />
          <button className="ctx-item" onClick={ctxReveal}>
            {L.ctxReveal}
          </button>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onMouseDown={() => closeModal(modal.kind === "prompt" ? null : false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-message">{modal.message}</div>
            {modal.kind === "prompt" && (
              <input
                ref={modalInputRef}
                className="modal-input"
                value={modal.value}
                autoFocus
                onChange={(e) =>
                  setModal((m) => (m ? { ...m, value: e.target.value } : m))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    closeModal(modal.value);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    closeModal(null);
                  }
                }}
              />
            )}
            <div className="modal-actions">
              <button
                className="modal-btn"
                onClick={() => closeModal(modal.kind === "prompt" ? null : false)}
              >
                {L.cancel}
              </button>
              <button
                className={`modal-btn primary ${modal.danger ? "danger" : ""}`}
                onClick={() =>
                  closeModal(modal.kind === "prompt" ? modal.value : true)
                }
              >
                {L.ok}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
