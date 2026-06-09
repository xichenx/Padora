export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  children: FileNode[];
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface SearchMatch {
  line: number;
  text: string;
}

export interface SearchResult {
  name: string;
  path: string;
  matches: SearchMatch[];
}

export type ViewMode = "preview" | "split" | "source";

export type Theme = "light" | "dark";

export type SidebarTab = "files" | "search";

export interface AppPreferences {
  theme?: Theme;
  viewMode?: ViewMode;
  showSidebar?: boolean;
  showOutline?: boolean;
  sidebarWidth?: number;
  splitRatio?: number;
  lastFolder?: string;
  lastFile?: string;
  openedFiles?: string[];
}

export interface ModalState {
  kind: "prompt" | "confirm";
  message: string;
  value: string;
  danger?: boolean;
}

export interface ContextMenuState {
  x: number;
  y: number;
  node: FileNode;
}

export interface FileJump {
  line: number;
  query: string;
}
