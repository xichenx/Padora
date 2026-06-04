# Padora

**Typora** 風の軽量 Markdown エディタ（Windows / macOS / Linux）。**Tauri 2 + React + Rust** で構築。ローカルファースト、クラウドアカウント不要。

**他の言語：** [English](README.md) · [中文](README.zh-CN.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

[機能](#機能) · [ダウンロード](#ダウンロード) · [開発](#開発) · [リリース](#リリース)

---

## 機能

- **3 つの表示モード** — プレビュー / 分割 / ソース
- **ローカルファイル** — 単一 `.md` またはフォルダを開く；サイドバーでファイル一覧とツリー
- **リッチ Markdown** — GFM 表、タスクリスト、シンタックスハイライト、KaTeX 数式、HTML 埋め込み
- **検索** — ファイル内検索（`Ctrl/Cmd+F`）とフォルダ横断検索（`Ctrl/Cmd+Shift+F`）
- **アウトライン** — 見出しから自動生成、クリックでジャンプ
- **画像** — ドラッグ＆ドロップまたは貼り付け；`assets/` に保存して自動挿入
- **テーマ** — ライト / ダーク
- **多言語 UI** — 中国語・英語（ネイティブメニュー対応）
- **設定の保存** — テーマ、表示モード、サイドバー幅、最後に開いたファイルなど

## ダウンロード

[GitHub Releases](https://github.com/xichenx/Padora/releases) からインストーラを取得：

| プラットフォーム | 形式 |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> プレビュー版は**コード署名なし**。macOS は「システム設定 → プライバシーとセキュリティ」で許可。Windows の SmartScreen 警告は「実行」を選択。

## キーボードショートカット

| 操作 | Windows / Linux | macOS |
| --- | --- | --- |
| 新規ファイル | `Ctrl+N` | `Cmd+N` |
| ファイルを開く | `Ctrl+O` | `Cmd+O` |
| フォルダを開く | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| 保存 | `Ctrl+S` | `Cmd+S` |
| 名前を付けて保存 | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| 検索 | `Ctrl+F` | `Cmd+F` |
| 全体検索 | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| プレビュー | `Ctrl+1` | `Cmd+1` |
| 分割 | `Ctrl+2` | `Cmd+2` |
| ソース | `Ctrl+3` | `Cmd+3` |
| サイドバー切替 | `Ctrl+\` | `Cmd+\` |
| テーマ切替 | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## 技術スタック

| レイヤ | 技術 |
| --- | --- |
| デスクトップ | [Tauri 2](https://v2.tauri.app/) |
| フロントエンド | React 19 · TypeScript · Vite 7 |
| レンダリング | react-markdown · remark-gfm · KaTeX · highlight.js |
| バックエンド | Rust |

## 開発

### 必要条件

- [Node.js](https://nodejs.org/) (LTS)、[pnpm](https://pnpm.io/) 9+、[Rust](https://www.rust-lang.org/tools/install) stable
- プラットフォーム別依存 — [公式ドキュメント](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu):**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### 実行

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev
```

### ビルド

```bash
pnpm tauri build
```

出力: `src-tauri/target/release/bundle/`

## リリース

1. `src-tauri/tauri.conf.json` と `package.json` の `version` を更新
2. `git tag v0.1.0 && git push origin v0.1.0`
3. [Actions](https://github.com/xichenx/Padora/actions) で完了を待ち、[Releases](https://github.com/xichenx/Padora/releases) で公開

リポジトリ設定: **Settings → Actions → Workflow permissions → Read and write permissions**

## フィードバック

[Issues](https://github.com/xichenx/Padora/issues) へどうぞ。
