import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FileJump, ViewMode } from "../types";

interface UseFindOptions {
  content: string;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  previewScrollRef: React.RefObject<HTMLDivElement | null>;
  deferredContent: string;
}

export function useFind({
  content,
  viewMode,
  setViewMode,
  editorRef,
  contentRef,
  previewScrollRef,
  deferredContent,
}: UseFindOptions) {
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState("");
  const [matchIndex, setMatchIndex] = useState(-1);
  const [jumpNonce, setJumpNonce] = useState(0);
  const pendingJumpRef = useRef<FileJump | null>(null);
  const findInputRef = useRef<HTMLInputElement>(null);

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

  const selectMatch = useCallback(
    (i: number) => {
      const el = editorRef.current;
      if (!el || matchOffsets.length === 0) return;
      const idx =
        ((i % matchOffsets.length) + matchOffsets.length) % matchOffsets.length;
      const start = matchOffsets[idx];
      setMatchIndex(idx);
      el.setSelectionRange(start, start + findText.length);
      const before = content.slice(0, start).split("\n").length - 1;
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 24;
      el.scrollTop = Math.max(0, before * lh - el.clientHeight / 2);
      findInputRef.current?.focus();
    },
    [matchOffsets, findText, content, editorRef],
  );

  const findNext = useCallback(
    () => selectMatch(matchIndex + 1),
    [selectMatch, matchIndex],
  );

  const findPrev = useCallback(
    () => selectMatch(matchIndex - 1),
    [selectMatch, matchIndex],
  );

  const openFind = useCallback(() => {
    if (viewMode === "preview") setViewMode("split");
    setShowFind(true);
    requestAnimationFrame(() => findInputRef.current?.focus());
  }, [viewMode, setViewMode]);

  const scheduleJump = useCallback(
    (jump: FileJump) => {
      pendingJumpRef.current = jump;
      setViewMode((m) => (m === "preview" ? "split" : m));
      if (jump.query) {
        setFindText(jump.query);
        setShowFind(true);
      }
      setJumpNonce((n) => n + 1);
    },
    [setViewMode],
  );

  useEffect(() => {
    if (!showFind || matchOffsets.length === 0) {
      setMatchIndex(-1);
      return;
    }
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

      let idx = matchOffsets.findIndex((o) => o >= lineStart && o <= lineEnd);
      if (idx < 0) idx = matchOffsets.findIndex((o) => o >= lineStart);
      if (idx < 0) idx = 0;

      pendingJumpRef.current = null;
      selectMatch(idx);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpNonce]);

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
  }, [matchIndex, deferredContent, showFind, findText, contentRef, previewScrollRef]);

  return {
    showFind,
    setShowFind,
    findText,
    setFindText,
    matchIndex,
    matchOffsets,
    findInputRef,
    findNext,
    findPrev,
    openFind,
    scheduleJump,
  };
}
