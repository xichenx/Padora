import { useCallback, useEffect, useState } from "react";
import type { Theme, ViewMode } from "../types";
import { PREFS, savePrefs } from "../lib/prefs";

export function usePreferences() {
  const [theme, setTheme] = useState<Theme>(
    PREFS.theme === "dark" ? "dark" : "light",
  );
  const [showSidebar, setShowSidebar] = useState(PREFS.showSidebar !== false);
  const [showOutline, setShowOutline] = useState(PREFS.showOutline === true);
  const [viewMode, setViewMode] = useState<ViewMode>(
    PREFS.viewMode === "split" || PREFS.viewMode === "source"
      ? PREFS.viewMode
      : "preview",
  );
  const [sidebarWidth, setSidebarWidth] = useState<number>(
    typeof PREFS.sidebarWidth === "number" ? PREFS.sidebarWidth : 250,
  );
  const [splitRatio, setSplitRatio] = useState<number>(
    typeof PREFS.splitRatio === "number" ? PREFS.splitRatio : 0.5,
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const isMac = /Mac|iPhone|iPad/.test(
      navigator.platform || navigator.userAgent,
    );
    document.documentElement.setAttribute("data-os", isMac ? "mac" : "other");
  }, []);

  const persist = useCallback(
    (extra: {
      lastFolder?: string;
      lastFile?: string;
      openedFiles: string[];
    }) => {
      savePrefs({
        theme,
        viewMode,
        showSidebar,
        showOutline,
        sidebarWidth,
        splitRatio,
        lastFolder: extra.lastFolder ?? PREFS.lastFolder ?? "",
        lastFile: extra.lastFile ?? PREFS.lastFile ?? "",
        openedFiles: extra.openedFiles,
      });
    },
    [theme, viewMode, showSidebar, showOutline, sidebarWidth, splitRatio],
  );

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

  const startSplitResize = useCallback(
    (paneHostRef: React.RefObject<HTMLDivElement | null>) =>
      (e: React.MouseEvent) => {
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
      },
    [],
  );

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    [],
  );

  return {
    theme,
    setTheme,
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
  };
}
