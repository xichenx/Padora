import { useEffect, useRef } from "react";
import { IS_TAURI } from "../lib/env";

/** Listen for native menu events forwarded from Rust. */
export function useMenuListener(onMenu: (id: string) => void) {
  const handlerRef = useRef(onMenu);
  useEffect(() => {
    handlerRef.current = onMenu;
  }, [onMenu]);

  useEffect(() => {
    if (!IS_TAURI) return;
    let unlisten: (() => void) | undefined;
    import("@tauri-apps/api/event")
      .then(({ listen }) =>
        listen<string>("menu", (e) => handlerRef.current(e.payload)),
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
}

interface UseKeyboardShortcutsOptions {
  saveFile: () => void;
  openFind: () => void;
  openGlobalSearch: () => void;
  showFind: boolean;
  onCloseFind: () => void;
}

export function useKeyboardShortcuts({
  saveFile,
  openFind,
  openGlobalSearch,
  showFind,
  onCloseFind,
}: UseKeyboardShortcutsOptions) {
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
        onCloseFind();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveFile, openFind, openGlobalSearch, showFind, onCloseFind]);
}

interface UseContextMenuOptions {
  ctxMenu: unknown;
  onClose: () => void;
}

export function useContextMenuDismiss({
  ctxMenu,
  onClose,
}: UseContextMenuOptions) {
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
  }, [ctxMenu, onClose]);
}

export function useDragDrop(onDropPaths: (paths: string[]) => void) {
  const handlerRef = useRef(onDropPaths);
  useEffect(() => {
    handlerRef.current = onDropPaths;
  }, [onDropPaths]);

  useEffect(() => {
    if (!IS_TAURI) return;
    let unlisten: (() => void) | undefined;
    import("@tauri-apps/api/webview")
      .then(({ getCurrentWebview }) =>
        getCurrentWebview().onDragDropEvent((event) => {
          const payload = event.payload as { type: string; paths?: string[] };
          if (payload.type === "drop" && Array.isArray(payload.paths)) {
            void handlerRef.current(payload.paths);
          }
        }),
      )
      .then((u) => {
        unlisten = u;
      })
      .catch(() => {
        /* drag-drop unavailable */
      });
    return () => {
      unlisten?.();
    };
  }, []);
}

export function useDirtyCloseGuard(
  dirty: boolean,
  confirmMessage: string,
  confirmBox: (message: string, danger?: boolean) => Promise<boolean>,
) {
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    if (!IS_TAURI) return;
    let unlisten: (() => void) | undefined;
    import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => {
        const win = getCurrentWindow();
        return win.onCloseRequested(async (event) => {
          if (!dirtyRef.current) return;
          event.preventDefault();
          const ok = await confirmBox(confirmMessage, true);
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
  }, [confirmBox, confirmMessage]);
}

export function useLangSync(
  lang: string,
  rebuildMenu: (lang: string) => Promise<void>,
) {
  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    if (IS_TAURI) {
      rebuildMenu(lang).catch(() => {
        /* menu rebuild is best-effort */
      });
    }
  }, [lang, rebuildMenu]);
}

export function useStartupRestore(
  onRestoreFolder: (path: string) => Promise<void>,
  onRestoreFile: (path: string) => Promise<void>,
  lastFolder?: string,
  lastFile?: string,
) {
  useEffect(() => {
    if (!IS_TAURI) return;
    (async () => {
      if (lastFolder) {
        try {
          await onRestoreFolder(lastFolder);
        } catch {
          /* folder may have moved */
        }
      }
      if (lastFile) {
        try {
          await onRestoreFile(lastFile);
        } catch {
          /* file may have moved */
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
