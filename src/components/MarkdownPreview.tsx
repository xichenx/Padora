import {
  Fragment,
  cloneElement,
  isValidElement,
  useCallback,
  useMemo,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { convertFileSrc } from "@tauri-apps/api/core";
import type { ViewMode } from "../types";
import { dirOf } from "../lib/paths";

interface MarkdownPreviewProps {
  content: string;
  filePath: string;
  viewMode: ViewMode;
  splitRatio: number;
  findText: string;
  matchCount: number;
  contentRef: React.RefObject<HTMLDivElement | null>;
  previewScrollRef: React.RefObject<HTMLDivElement | null>;
  onContentClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function MarkdownPreview({
  content,
  filePath,
  viewMode,
  splitRatio,
  findText,
  matchCount,
  contentRef,
  previewScrollRef,
  onContentClick,
}: MarkdownPreviewProps) {
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
      if (!needle || matchCount === 0) return value;

      const lowerValue = value.toLowerCase();
      const lowerNeedle = needle.toLowerCase();
      const parts: React.ReactNode[] = [];
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
    [findText, matchCount],
  );

  const highlightFindChildren = useCallback(
    (children: React.ReactNode): React.ReactNode => {
      if (!findText.trim() || matchCount === 0) return children;
      if (typeof children === "string") return renderFindHighlights(children);
      if (Array.isArray(children)) {
        return children.map((child, index) => (
          <Fragment key={index}>{highlightFindChildren(child)}</Fragment>
        ));
      }
      if (isValidElement(children)) {
        const props = children.props as { children?: React.ReactNode };
        if (props.children == null) return children;
        return cloneElement(
          children,
          undefined,
          highlightFindChildren(props.children),
        );
      }
      return children;
    },
    [findText, matchCount, renderFindHighlights],
  );

  const markdownComponents = useMemo(
    () => ({
      a: ({ children, ...props }: React.ComponentProps<"a">) => (
        <a {...props}>{highlightFindChildren(children)}</a>
      ),
      p: ({ children, ...props }: React.ComponentProps<"p">) => (
        <p {...props}>{highlightFindChildren(children)}</p>
      ),
      li: ({ children, ...props }: React.ComponentProps<"li">) => (
        <li {...props}>{highlightFindChildren(children)}</li>
      ),
      h1: ({ children, ...props }: React.ComponentProps<"h1">) => (
        <h1 {...props}>{highlightFindChildren(children)}</h1>
      ),
      h2: ({ children, ...props }: React.ComponentProps<"h2">) => (
        <h2 {...props}>{highlightFindChildren(children)}</h2>
      ),
      h3: ({ children, ...props }: React.ComponentProps<"h3">) => (
        <h3 {...props}>{highlightFindChildren(children)}</h3>
      ),
      h4: ({ children, ...props }: React.ComponentProps<"h4">) => (
        <h4 {...props}>{highlightFindChildren(children)}</h4>
      ),
      h5: ({ children, ...props }: React.ComponentProps<"h5">) => (
        <h5 {...props}>{highlightFindChildren(children)}</h5>
      ),
      h6: ({ children, ...props }: React.ComponentProps<"h6">) => (
        <h6 {...props}>{highlightFindChildren(children)}</h6>
      ),
      td: ({ children, ...props }: React.ComponentProps<"td">) => (
        <td {...props}>{highlightFindChildren(children)}</td>
      ),
      th: ({ children, ...props }: React.ComponentProps<"th">) => (
        <th {...props}>{highlightFindChildren(children)}</th>
      ),
      blockquote: ({ children, ...props }: React.ComponentProps<"blockquote">) => (
        <blockquote {...props}>{highlightFindChildren(children)}</blockquote>
      ),
      img: ({ src, ...props }: React.ComponentProps<"img">) => (
        <img src={resolveImg(src)} {...props} />
      ),
    }),
    [resolveImg, highlightFindChildren],
  );

  return (
    <div
      className="pane preview-pane"
      ref={previewScrollRef}
      onClick={onContentClick}
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
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
