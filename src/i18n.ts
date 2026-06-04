export type Lang = "zh" | "en";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "zh", label: "中文" },
  { id: "en", label: "English" },
];

const LANG_KEY = "markview.lang";

// Resolve the initial language: persisted choice first, then the browser
// locale, falling back to Chinese.
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  const nav =
    typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "zh";
  return nav.startsWith("zh") ? "zh" : "en";
}

export function persistLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* ignore */
  }
}

export interface Strings {
  // Toolbar
  fileTree: string;
  openFile: string;
  openFolder: string;
  save: string;
  find: string;
  outline: string;
  toggleTheme: string;
  switchLang: string;
  // View modes
  viewPreview: string;
  viewSplit: string;
  viewSource: string;
  // Sidebar
  tabFiles: string;
  tabSearch: string;
  noFolder: string;
  openFolderBtn: string;
  noOpenedFiles: string;
  openFileBtn: string;
  removeFromList: string;
  searchPlaceholder: string;
  searchPlaceholderNoFolder: string;
  clear: string;
  searching: string;
  searchSummary: (files: number, matches: number) => string;
  // Editor / find bar
  editorPlaceholder: string;
  findInFile: string;
  findPrev: string;
  findNext: string;
  findClose: string;
  dragWidth: string;
  // Outline
  outlineTitle: string;
  noHeading: string;
  // Status bar
  words: (n: number) => string;
  chars: (n: number) => string;
  lines: (n: number) => string;
  unsaved: string;
  saved: string;
  newDoc: string;
  // Context menu
  ctxNewFile: string;
  ctxRename: string;
  ctxDelete: string;
  ctxReveal: string;
  // Dialogs
  confirmCloseUnsaved: string;
  confirmSwitchUnsaved: string;
  promptNewFile: string;
  defaultNewFileName: string;
  promptRename: string;
  confirmDelete: (name: string) => string;
  pasteNeedApp: string;
  pasteSaveFirst: string;
  ok: string;
  cancel: string;
  // Editor formatting placeholders
  bold: string;
  italic: string;
  code: string;
  linkText: string;
  // Defaults
  welcomeTitle: string;
  untitled: string;
}

const zh: Strings = {
  fileTree: "文件树",
  openFile: "打开文件",
  openFolder: "打开文件夹",
  save: "保存 (Cmd/Ctrl+S)",
  find: "查找替换 (Cmd/Ctrl+F)",
  outline: "大纲",
  toggleTheme: "切换主题",
  switchLang: "切换语言",
  viewPreview: "预览",
  viewSplit: "分屏",
  viewSource: "源码",
  tabFiles: "文件",
  tabSearch: "搜索",
  noFolder: "暂无文件夹",
  openFolderBtn: "打开文件夹",
  noOpenedFiles: "暂无打开的文件",
  openFileBtn: "打开文件",
  removeFromList: "从列表移除",
  searchPlaceholder: "全局搜索…",
  searchPlaceholderNoFolder: "请先打开文件夹",
  clear: "清除",
  searching: "搜索中…",
  searchSummary: (files, matches) => `${files} 个文件 · ${matches} 处匹配`,
  editorPlaceholder: "在此输入 Markdown…",
  findInFile: "查找当前文件",
  findPrev: "上一个 (Shift+Enter)",
  findNext: "下一个 (Enter)",
  findClose: "关闭 (Esc)",
  dragWidth: "拖拽调整宽度",
  outlineTitle: "大纲",
  noHeading: "无标题",
  words: (n) => `${n} 字`,
  chars: (n) => `${n} 字符`,
  lines: (n) => `${n} 行`,
  unsaved: "未保存",
  saved: "已保存",
  newDoc: "新文档",
  ctxNewFile: "新建 Markdown…",
  ctxRename: "重命名…",
  ctxDelete: "删除",
  ctxReveal: "在 Finder 中显示",
  confirmCloseUnsaved: "有未保存的修改，确定要退出吗？",
  confirmSwitchUnsaved: "当前文件有未保存的修改，确定要切换吗？",
  promptNewFile: "新建 Markdown 文件名：",
  defaultNewFileName: "未命名.md",
  promptRename: "重命名为：",
  confirmDelete: (name) => `确定删除「${name}」？此操作不可撤销。`,
  pasteNeedApp: "图片粘贴需在应用内运行",
  pasteSaveFirst: "请先保存文档后再粘贴图片",
  ok: "确定",
  cancel: "取消",
  bold: "加粗",
  italic: "斜体",
  code: "代码",
  linkText: "链接文字",
  welcomeTitle: "欢迎",
  untitled: "未命名",
};

const en: Strings = {
  fileTree: "File tree",
  openFile: "Open file",
  openFolder: "Open folder",
  save: "Save (Cmd/Ctrl+S)",
  find: "Find (Cmd/Ctrl+F)",
  outline: "Outline",
  toggleTheme: "Toggle theme",
  switchLang: "Switch language",
  viewPreview: "Preview",
  viewSplit: "Split",
  viewSource: "Source",
  tabFiles: "Files",
  tabSearch: "Search",
  noFolder: "No folder yet",
  openFolderBtn: "Open folder",
  noOpenedFiles: "No opened files",
  openFileBtn: "Open file",
  removeFromList: "Remove from list",
  searchPlaceholder: "Search all files…",
  searchPlaceholderNoFolder: "Open a folder first",
  clear: "Clear",
  searching: "Searching…",
  searchSummary: (files, matches) =>
    `${files} file${files === 1 ? "" : "s"} · ${matches} match${matches === 1 ? "" : "es"}`,
  editorPlaceholder: "Type Markdown here…",
  findInFile: "Find in file",
  findPrev: "Previous (Shift+Enter)",
  findNext: "Next (Enter)",
  findClose: "Close (Esc)",
  dragWidth: "Drag to resize",
  outlineTitle: "Outline",
  noHeading: "No headings",
  words: (n) => `${n} words`,
  chars: (n) => `${n} chars`,
  lines: (n) => `${n} lines`,
  unsaved: "Unsaved",
  saved: "Saved",
  newDoc: "New document",
  ctxNewFile: "New Markdown…",
  ctxRename: "Rename…",
  ctxDelete: "Delete",
  ctxReveal: "Reveal in Finder",
  confirmCloseUnsaved: "You have unsaved changes. Quit anyway?",
  confirmSwitchUnsaved: "The current file has unsaved changes. Switch anyway?",
  promptNewFile: "New Markdown file name:",
  defaultNewFileName: "untitled.md",
  promptRename: "Rename to:",
  confirmDelete: (name) => `Delete "${name}"? This cannot be undone.`,
  pasteNeedApp: "Image paste only works inside the app",
  pasteSaveFirst: "Save the document before pasting images",
  ok: "OK",
  cancel: "Cancel",
  bold: "bold",
  italic: "italic",
  code: "code",
  linkText: "link text",
  welcomeTitle: "Welcome",
  untitled: "Untitled",
};

export const STRINGS: Record<Lang, Strings> = { zh, en };

export function welcomeDoc(lang: Lang): string {
  if (lang === "en") {
    return `# Welcome to MarkView

A **Typora**-like Markdown reader and editor, built with **Tauri + React**.

## Getting started

- Click **Open file** in the top-left to pick a \`.md\` file
- Or click **Open folder** to load a whole directory into the sidebar
- Switch between **Preview / Split / Source** views from the top bar
- \`Cmd/Ctrl + F\` opens the **find** bar, \`Cmd/Ctrl + S\` saves
- **Drag** an image into the window to copy it into \`assets/\` and insert it

## Supported syntax

### Tables (GFM)

| Feature | Supported |
| --- | :---: |
| Tables | ✅ |
| Task lists | ✅ |
| Code highlight | ✅ |
| Math | ✅ |
| Image drag | ✅ |
| Find | ✅ |

### Task list

- [x] Read local Markdown files
- [x] Live editing and split source
- [x] Image drag-and-drop
- [x] Find

### Code block

\`\`\`rust
#[tauri::command]
fn import_image(src: String, md_path: String) -> Result<String, String> {
    // copy the image into assets and return a relative path
    Ok(String::new())
}
\`\`\`

### Math

Inline \$E = mc^2\$, and a block:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

> Tip: save the document before dragging images so they land in the \`assets/\` folder next to it.
`;
  }
  return `# 欢迎使用 MarkView

一个仿 **Typora** 的 Markdown 阅读器与编辑器，基于 **Tauri + React** 构建。

## 开始使用

- 点击左上角 **打开文件** 选择一个 \`.md\` 文件
- 或点击 **打开文件夹** 把整个目录加载到左侧文件树
- 顶部可切换 **预览 / 分屏 / 源码** 三种视图
- \`Cmd/Ctrl + F\` 打开 **查找替换** 栏，\`Cmd/Ctrl + S\` 保存
- 把图片 **拖拽** 进窗口即可自动复制到 \`assets/\` 并插入

## 支持的语法

### 表格 (GFM)

| 功能 | 是否支持 |
| --- | :---: |
| 表格 | ✅ |
| 任务列表 | ✅ |
| 代码高亮 | ✅ |
| 数学公式 | ✅ |
| 图片拖拽 | ✅ |
| 查找替换 | ✅ |

### 任务列表

- [x] 读取本地 Markdown 文件
- [x] 实时编辑与分屏源码
- [x] 图片拖拽插入
- [x] 查找替换

### 代码块

\`\`\`rust
#[tauri::command]
fn import_image(src: String, md_path: String) -> Result<String, String> {
    // 复制图片到 assets 并返回相对路径
    Ok(String::new())
}
\`\`\`

### 数学公式

行内公式 \$E = mc^2\$，块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

> 提示：拖拽图片前请先保存文档，这样图片才能放进文档同级的 \`assets/\` 目录。
`;
}
