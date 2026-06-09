import { useCallback } from "react";
import type { Strings } from "../i18n";
import { WRAP_PAIRS } from "../lib/constants";

interface UseEditorKeysOptions {
  content: string;
  setContent: (value: string) => void;
  setDirty: (dirty: boolean) => void;
  wrapSelection: (marker: string, placeholder?: string) => void;
  insertLink: () => void;
  L: Strings;
}

export function useEditorKeyDown({
  content,
  setContent,
  setDirty,
  wrapSelection,
  insertLink,
  L,
}: UseEditorKeysOptions) {
  return useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      const mod = e.metaKey || e.ctrlKey;
      const start = el.selectionStart;
      const end = el.selectionEnd;

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

      if (e.key === "Enter" && !e.shiftKey && start === end) {
        const lineStart = content.lastIndexOf("\n", start - 1) + 1;
        const line = content.slice(lineStart, start);
        const m = line.match(/^(\s*)([-*+]\s\[[ xX]\]\s|[-*+]\s|\d+\.\s|>\s?)/);
        if (m) {
          const indent = m[1];
          let marker = m[2];
          const rest = line.slice(m[0].length);
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
    [content, wrapSelection, insertLink, L, setContent, setDirty],
  );
}

export function useEditorMutations(
  content: string,
  editorRef: React.RefObject<HTMLTextAreaElement | null>,
  setContent: (value: string) => void,
  setDirty: (dirty: boolean) => void,
) {
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
    [content, editorRef, setContent, setDirty],
  );

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

  const insertAtCursor = useCallback(
    (text: string) => {
      const el = editorRef.current;
      if (el) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        setContent(content.slice(0, start) + text + content.slice(end));
        setDirty(true);
        requestAnimationFrame(() => {
          el.focus();
          el.selectionStart = el.selectionEnd = start + text.length;
        });
      } else {
        setContent(`${content}${content.endsWith("\n") ? "" : "\n"}${text}\n`);
        setDirty(true);
      }
    },
    [content, editorRef, setContent, setDirty],
  );

  return { applyEdit, wrapSelection, insertAtCursor };
}
