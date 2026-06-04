# Padora

A lightweight, **Typora**-inspired Markdown reader and editor for Windows, macOS, and Linux. Built with **Tauri 2 + React + Rust** — local-first, no cloud account required.

**Read in other languages:** [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

[Features](#features) · [Download](#download) · [Development](#development) · [Release](#release)

---

## Features

- **Three view modes** — Preview, split, and source; switch anytime while editing
- **Local files** — Open a single `.md` file or an entire folder; sidebar with opened files and directory tree
- **Rich Markdown** — GFM tables, task lists, syntax highlighting, KaTeX math, embedded HTML
- **Search** — In-file find (`Ctrl/Cmd+F`) and cross-folder search (`Ctrl/Cmd+Shift+F`)
- **Outline** — Auto-generated from headings; click to jump
- **Images** — Drag-and-drop or paste; saved to `assets/` next to the document and inserted automatically
- **Themes** — Light and dark mode
- **i18n** — Chinese and English UI with native menus
- **Preferences** — Theme, view mode, sidebar width, last opened file/folder, and more are persisted

## Download

Get installers from [GitHub Releases](https://github.com/xichenx/Padora/releases):

| Platform | Artifacts |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Early preview builds are **not code-signed**. On macOS, allow the app under **System Settings → Privacy & Security**. On Windows, SmartScreen may warn — choose **Run anyway**.

## Keyboard shortcuts

| Action | Windows / Linux | macOS |
| --- | --- | --- |
| New file | `Ctrl+N` | `Cmd+N` |
| Open file | `Ctrl+O` | `Cmd+O` |
| Open folder | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Save | `Ctrl+S` | `Cmd+S` |
| Save as | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| Find | `Ctrl+F` | `Cmd+F` |
| Global search | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Preview mode | `Ctrl+1` | `Cmd+1` |
| Split mode | `Ctrl+2` | `Cmd+2` |
| Source mode | `Ctrl+3` | `Cmd+3` |
| Toggle sidebar | `Ctrl+\` | `Cmd+\` |
| Toggle theme | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## Tech stack

| Layer | Technology |
| --- | --- |
| Desktop shell | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Rendering | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust (file I/O, directory scan, image import, native menu) |

## Project structure

```
Padora/
├── src/                 # React frontend
│   ├── App.tsx          # Main UI and logic
│   ├── App.css          # Styles and themes
│   └── i18n.ts          # UI strings (zh / en)
├── src-tauri/           # Tauri / Rust backend
│   ├── src/lib.rs       # Commands and native menu
│   └── tauri.conf.json  # App configuration
└── .github/workflows/   # CI / release pipelines
```

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) stable
- Platform-specific Tauri deps — see [official docs](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu) extras:**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Install and run

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev      # Desktop dev mode
```

Frontend-only preview (browser; no Tauri APIs):

```bash
pnpm dev
```

### Build locally

```bash
pnpm tauri build
```

Output: `src-tauri/target/release/bundle/`.

### Recommended IDE

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) extension
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Release

GitHub Actions (`.github/workflows/release.yml`) builds and uploads installers when you push a version tag.

**One-time repo setting:**

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

**Steps:**

1. Bump `version` in `src-tauri/tauri.conf.json` and `package.json`
2. Commit and push to `main`
3. Tag and push:

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

4. Wait for the [Actions](https://github.com/xichenx/Padora/actions) workflow
5. Open the draft on [Releases](https://github.com/xichenx/Padora/releases), verify assets, click **Publish release**

You can also trigger **Release** manually via `workflow_dispatch` on the Actions tab.

## Feedback

Bug reports and feature requests: [Issues](https://github.com/xichenx/Padora/issues).
