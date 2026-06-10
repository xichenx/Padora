# Padora

**Typora** 風の軽量 Markdown リーダー／エディタ（Windows / macOS / Linux）。**Tauri 2 + React + Rust** で構築。ローカルファースト、クラウドアカウント不要。

<!-- README-I18N:START -->

[English](README.md) · [中文](README.zh-CN.md) · **日本語** · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

<!-- README-I18N:END -->

[機能](#機能) · [ダウンロード](#ダウンロード) · [開発](#開発) · [リリース](#リリース)

---

## 機能

- **3 つの表示モード** — プレビュー / 分割 / ソース。編集中いつでも切り替え可能
- **ローカルファイル** — 単一 `.md` またはフォルダを開く。サイドバーで開いたファイルとディレクトリツリーを管理
- **リッチ Markdown** — GFM 表、タスクリスト、シンタックスハイライト、KaTeX 数式、HTML 埋め込み
- **検索** — ファイル内検索（`Ctrl/Cmd+F`）とフォルダ横断検索（`Ctrl/Cmd+Shift+F`）
- **アウトライン** — 見出しから自動生成、クリックでジャンプ
- **画像** — ドラッグ＆ドロップまたは貼り付け。`assets/` に保存して自動挿入
- **テーマ** — ライト / ダーク
- **多言語 UI** — 中国語・英語（ネイティブメニュー対応）
- **設定の保存** — テーマ、表示モード、サイドバー幅、最後に開いたファイル/フォルダなど

## ダウンロード

[GitHub Releases](https://github.com/xichenx/Padora/releases) からインストーラを取得：

| プラットフォーム | 形式 |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> プレビュー版は**コード署名なし**。Windows では「安全でない」警告が出る場合があります — [Windows でのインストール](#windows-でのインストール) を参照。macOS では **システム設定 → プライバシーとセキュリティ** で許可してください。

### Windows でのインストール

これは**想定どおりの動作**であり、ビルドの不具合ではありません。SmartScreen は、インターネット（GitHub Releases など）からダウンロードした未署名アプリを、発行者の評判が築かれるかコード署名証明書が使われるまでブロックします。

**`.msi` と `-setup.exe` の両方がある場合は `.msi` を推奨**します。

1. **ブラウザのダウンロード** — Edge/Chrome がブロックした場合は **保持** をクリック。
2. **ブロック解除** — インストーラを右クリック → **プロパティ** → **ブロック解除** にチェック → OK。
3. **SmartScreen** — インストーラをダブルクリック → 青い「Windows によって PC が保護されました」画面で **詳細情報** → **実行**。
4. **Defender の誤検知** — **Windows セキュリティ** → **保護の履歴** → 隔離された Padora を許可または復元。

恒久的な対策は下記 [Windows コード署名（任意）](#windows-コード署名任意) を参照。

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
| バックエンド | Rust（ファイル I/O、ディレクトリスキャン、画像インポート、ネイティブメニュー） |

## プロジェクト構成

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

## 開発

### 必要条件

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) stable
- プラットフォーム別 Tauri 依存 — [公式ドキュメント](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu) 追加パッケージ：**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### インストールと実行

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev      # Desktop dev mode
```

フロントエンドのみ（ブラウザ；Tauri API なし）：

```bash
pnpm dev
```

### ローカルビルド

```bash
pnpm tauri build
```

出力: `src-tauri/target/release/bundle/`

### 推奨 IDE

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) 拡張
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## リリース

GitHub Actions（`.github/workflows/release.yml`）がインストーラをビルド・アップロードします。**リリースバージョン**は次のいずれかから決まります：

| トリガー | バージョンの決まり方 |
| --- | --- |
| **tag プッシュ** `v0.2.0` | tag から解析 → **0.2.0** をビルド、Release **v0.2.0** を作成 |
| **手動実行**（Actions → Release → Run workflow） | **Release version** に入力（例: `0.2.0`、`v` なし） |

いずれの方法でも、先に `main` で `src-tauri/tauri.conf.json` と `package.json` の `version` を更新してコミットしてください。CI もそのバージョンをビルド成果物に書き込みます。

**初回のみのリポジトリ設定：**

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

### 方法 A — tag をプッシュ（推奨）

```bash
# 1. tauri.conf.json + package.json のバージョンを更新、main に push
git tag v0.2.0
git push origin v0.2.0
```

### 方法 B — 手動ワークフロー

1. [Actions → Release](https://github.com/xichenx/Padora/actions/workflows/release.yml) を開く
2. **Run workflow** をクリック
3. **Release version** に例: `0.2.0` を入力
4. 実行

[Releases](https://github.com/xichenx/Padora/releases) でドラフトを開き、成果物を確認して **Publish release** をクリック。

### Windows コード署名（任意）

詳細は **[docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)**（中国語、ステップバイステップ）を参照。

**チェックリスト：**

1. **Code Signing** 証明書を購入し `.pfx` としてエクスポート
2. GitHub **Secrets**: `WINDOWS_CERTIFICATE` (Base64), `WINDOWS_CERTIFICATE_PASSWORD`, `WINDOWS_CERTIFICATE_THUMBPRINT`
3. GitHub **Variable**: `ENABLE_WINDOWS_SIGNING` = `true`
4. tag をプッシュするか Release ワークフローを実行

ワークフローは Windows runner で証明書をインポートし、`tauri build` 時に `.exe` / `.msi` に署名します。

## フィードバック

バグ報告・機能要望: [Issues](https://github.com/xichenx/Padora/issues)
