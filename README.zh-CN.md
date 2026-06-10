# Padora

一款仿 **Typora** 的跨平台 Markdown 阅读与编辑器，基于 **Tauri 2 + React + Rust** 构建。轻量、本地优先，无需云端账号。

<!-- README-I18N:START -->

[English](README.md) · **中文** · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

<!-- README-I18N:END -->

[特性](#特性) · [下载](#下载) · [开发](#开发) · [发布](#发布)

---

## 特性

- **三种视图** — 预览 / 分屏 / 源码，随时切换编辑与阅读体验
- **本地文件** — 打开单个 `.md` 文件或整个文件夹，侧边栏管理已打开文件与目录树
- **Markdown 渲染** — GFM 表格、任务列表、代码高亮、KaTeX 数学公式、内嵌 HTML
- **搜索** — 文件内查找（`Ctrl/Cmd+F`）与文件夹全局搜索（`Ctrl/Cmd+Shift+F`）
- **大纲导航** — 根据标题自动生成，点击快速跳转
- **图片** — 拖拽或粘贴图片，自动保存到文档同级的 `assets/` 并插入引用
- **主题** — 浅色 / 深色模式
- **国际化** — 中文 / English 界面与原生菜单
- **偏好记忆** — 主题、视图、侧边栏宽度、上次打开的文件/文件夹等自动保存

## 下载

前往 [GitHub Releases](https://github.com/xichenx/Padora/releases) 下载对应平台的安装包：

| 平台 | 安装包 |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> 当前版本为早期预览，**安装包未做代码签名**。Windows 可能提示「不安全」——见下方 [Windows 安装说明](#windows-安装说明)。macOS 需在「系统设置 → 隐私与安全性」中允许打开。

### Windows 安装说明

这是**预期行为**，并非构建损坏。SmartScreen 会拦截从互联网（如 GitHub Releases）下载的未签名应用，直到发布者建立信誉或使用代码签名证书。

**若同时提供 `.msi` 与 `-setup.exe`，优先使用 `.msi` 安装包。**

1. **浏览器下载** — 若 Edge/Chrome 拦截文件，点击 **保留**。
2. **解除锁定** — 右键安装包 → **属性** → 勾选 **解除锁定** → 确定。
3. **SmartScreen** — 双击安装包 → 在蓝色「Windows 已保护你的电脑」界面点击 **更多信息** → **仍要运行**。
4. **Defender 误报** — 打开 **Windows 安全中心** → **保护历史记录** → 若 Padora 被隔离则允许或还原。

永久解决方案见下方 [Windows 代码签名（可选）](#windows-代码签名可选)。

## 快捷键

| 操作 | Windows / Linux | macOS |
| --- | --- | --- |
| 新建文件 | `Ctrl+N` | `Cmd+N` |
| 打开文件 | `Ctrl+O` | `Cmd+O` |
| 打开文件夹 | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| 保存 | `Ctrl+S` | `Cmd+S` |
| 另存为 | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| 查找 | `Ctrl+F` | `Cmd+F` |
| 全局搜索 | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| 预览模式 | `Ctrl+1` | `Cmd+1` |
| 分屏模式 | `Ctrl+2` | `Cmd+2` |
| 源码模式 | `Ctrl+3` | `Cmd+3` |
| 切换侧边栏 | `Ctrl+\` | `Cmd+\` |
| 切换主题 | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 桌面壳 | [Tauri 2](https://v2.tauri.app/) |
| 前端 | React 19 · TypeScript · Vite 7 |
| 渲染 | react-markdown · remark-gfm · KaTeX · highlight.js |
| 后端 | Rust（文件 I/O、目录扫描、图片导入、原生菜单） |

## 项目结构

```
Padora/
├── src/                      # React 前端
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

## 开发

### 环境要求

- [Node.js](https://nodejs.org/)（LTS）
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) stable
- 各平台 Tauri 依赖，见 [官方文档](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu) 额外依赖：**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### 安装与运行

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev      # 桌面应用开发模式
```

仅调试前端 UI（浏览器预览，文件读写等 Tauri 能力不可用）：

```bash
pnpm dev
```

### 本地打包

```bash
pnpm tauri build
```

产物位于 `src-tauri/target/release/bundle/`。

### 推荐 IDE

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) 扩展
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 发布

GitHub Actions（`.github/workflows/release.yml`）负责构建并上传安装包。**发布版本**由以下两种方式决定：

| 触发方式 | 版本来源 |
| --- | --- |
| **推送 tag** `v0.2.0` | 从 tag 解析 → 构建 **0.2.0**，创建 Release **v0.2.0** |
| **手动运行**（Actions → Release → Run workflow） | 在 **Release version** 输入框填写，如 `0.2.0`（不要加 `v`） |

无论哪种方式，建议先在 `main` 上更新 `src-tauri/tauri.conf.json` 与 `package.json` 中的 `version` 并提交。CI 构建时也会把该版本写入产物。

**首次使用前**，在 GitHub 仓库设置中开启：

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

### 方式 A — 推送 tag（推荐）

```bash
# 1. 改 tauri.conf.json + package.json 版本号，提交并 push main
git tag v0.2.0
git push origin v0.2.0
```

### 方式 B — 手动触发工作流

1. 打开 [Actions → Release](https://github.com/xichenx/Padora/actions/workflows/release.yml)
2. 点击 **Run workflow**
3. 在 **Release version** 填写版本号，如 `0.2.0`
4. 运行

然后在 [Releases](https://github.com/xichenx/Padora/releases) 打开草稿，核对安装包后点击 **Publish release**。

### Windows 代码签名（可选）

完整步骤见 **[docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)**（中文，分步说明）。

**快速清单：**

1. 购买 **Code Signing** 证书，导出 `.pfx`
2. GitHub **Secrets** 添加：`WINDOWS_CERTIFICATE`（Base64）、`WINDOWS_CERTIFICATE_PASSWORD`、`WINDOWS_CERTIFICATE_THUMBPRINT`
3. GitHub **Variables** 添加：`ENABLE_WINDOWS_SIGNING` = `true`
4. 推送 tag 或手动 Run Release 工作流

工作流会在 Windows runner 上导入证书，Tauri 在 `tauri build` 时对 `.exe` / `.msi` 进行签名。

## 反馈

欢迎通过 [Issues](https://github.com/xichenx/Padora/issues) 提交 Bug 报告或功能建议。
