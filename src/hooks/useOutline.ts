import { useCallback, useEffect, useState } from "react";
import type { Heading, ViewMode } from "../types";

interface UseOutlineOptions {
  deferredContent: string;
  viewMode: ViewMode;
  previewScrollRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export function useOutline({
  deferredContent,
  viewMode,
  previewScrollRef,
  contentRef,
}: UseOutlineOptions) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeading, setActiveHeading] = useState("");

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
  }, [deferredContent, viewMode, contentRef]);

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
  }, [headings, viewMode, previewScrollRef, contentRef]);

  const scrollToHeading = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return { headings, activeHeading, scrollToHeading };
}
