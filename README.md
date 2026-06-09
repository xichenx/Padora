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

> Early preview builds are **not code-signed**. Windows may show an "unsafe" warning — see [Installing on Windows](#installing-on-windows). On macOS, allow the app under **System Settings → Privacy & Security**.

### Installing on Windows

This is **expected**, not a broken build. SmartScreen blocks unsigned apps downloaded from the internet (e.g. GitHub Releases) until the publisher builds reputation or uses a code-signing certificate.

**Prefer the `.msi` installer** when both `.msi` and `-setup.exe` are available.

1. **Browser download** — If Edge/Chrome blocks the file, click **Keep**.
2. **Unblock the file** — Right-click the installer → **Properties** → check **Unblock** → OK.
3. **SmartScreen** — Double-click the installer → on the blue *"Windows protected your PC"* screen, click **More info** → **Run anyway**.
4. **Defender false positive** — Open **Windows Security** → **Protection history** → allow or restore Padora if quarantined.

For a permanent fix, see [Windows code signing](#windows-code-signing-optional) below.

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
├── src/                      # React frontend
│   ├── App.tsx               # Root orchestrator (wires hooks + components)
│   ├── App.css               # Styles and themes
│   ├── i18n.ts               # UI strings (zh / en)
│   ├── types/                # Shared TypeScript types
│   ├── lib/                  # Pure utilities (paths, prefs, constants)
│   ├── services/             # Tauri API wrappers
│   ├── hooks/                # Domain logic (document, find, search, …)
│   └── components/           # UI components (Toolbar, Sidebar, Editor, …)
├── src-tauri/                # Tauri / Rust backend
│   ├── src/
│   │   ├── lib.rs            # App entry & command registration
│   │   ├── commands/         # Tauri commands (file, image, search)
│   │   ├── menu.rs           # Native menu builder
│   │   ├── models.rs         # Shared structs
│   │   └── fs_util.rs        # Filesystem helpers
│   └── tauri.conf.json       # App configuration
└── .github/workflows/        # CI / release pipelines
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

GitHub Actions (`.github/workflows/release.yml`) builds and uploads installers. **The release version** comes from one of two sources:

| Trigger | Where the version comes from |
| --- | --- |
| **Push tag** `v0.2.0` | Parsed from the tag → builds **0.2.0**, creates Release **v0.2.0** |
| **Manual run** (Actions → Release → Run workflow) | You type the version in **Release version** (e.g. `0.2.0`, no `v` prefix) |

Before either method, bump `version` in `src-tauri/tauri.conf.json` and `package.json` on `main` and commit (keeps the repo in sync). CI also writes that version into the build artifacts for the release.

**One-time repo setting:**

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

### Option A — Push a tag (recommended)

```bash
# 1. Bump version in tauri.conf.json + package.json, commit, push main
git tag v0.2.0
git push origin v0.2.0
```

### Option B — Manual workflow

1. Open [Actions → Release](https://github.com/xichenx/Padora/actions/workflows/release.yml)
2. Click **Run workflow**
3. Enter **Release version**, e.g. `0.2.0`
4. Run

Then open the draft on [Releases](https://github.com/xichenx/Padora/releases), verify assets, and click **Publish release**.

### Windows code signing (optional)

See **[docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)** (Chinese, step-by-step) for the full guide.

**Checklist:**

1. Buy a **Code Signing** certificate; export as `.pfx`
2. GitHub **Secrets**: `WINDOWS_CERTIFICATE` (Base64), `WINDOWS_CERTIFICATE_PASSWORD`, `WINDOWS_CERTIFICATE_THUMBPRINT`
3. GitHub **Variable**: `ENABLE_WINDOWS_SIGNING` = `true`
4. Push a tag or run the Release workflow

The workflow imports the cert on the Windows runner and Tauri signs the `.exe` / `.msi` during `tauri build`.

## Feedback

Bug reports and feature requests: [Issues](https://github.com/xichenx/Padora/issues).
