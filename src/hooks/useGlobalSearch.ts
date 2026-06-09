import { useEffect, useMemo, useRef, useState } from "react";
import type { FileNode, SearchResult, SidebarTab } from "../types";
import { searchDir } from "../services/tauri";

interface UseGlobalSearchOptions {
  sidebarTab: SidebarTab;
  tree: FileNode | null;
  setError: (msg: string) => void;
}

export function useGlobalSearch({
  sidebarTab,
  tree,
  setError,
}: UseGlobalSearchOptions) {
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const globalInputRef = useRef<HTMLInputElement>(null);

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
        const res = await searchDir(tree.path, q);
        setSearchResults(res);
      } catch (e) {
        setError(String(e));
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(id);
  }, [globalQuery, sidebarTab, tree, setError]);

  const totalMatches = useMemo(
    () => searchResults.reduce((sum, r) => sum + r.matches.length, 0),
    [searchResults],
  );

  return {
    globalQuery,
    setGlobalQuery,
    searchResults,
    searching,
    totalMatches,
    globalInputRef,
  };
}