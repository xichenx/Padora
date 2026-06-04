# Padora

一款仿 **Typora** 的跨平台 Markdown 阅读与编辑器，基于 **Tauri 2 + React + Rust** 构建。轻量、本地优先，无需云端账号。

**其他语言：** [English](README.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

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

> 当前版本为早期预览，安装包未做代码签名。macOS 需在「系统设置 → 隐私与安全性」中允许打开；Windows 可能触发 SmartScreen 提示，选择「仍要运行」即可。

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
├── src/                 # React 前端
│   ├── App.tsx          # 主界面与业务逻辑
│   ├── App.css          # 样式与主题
│   └── i18n.ts          # 中英文文案
├── src-tauri/           # Tauri / Rust 后端
│   ├── src/lib.rs       # 命令与原生菜单
│   └── tauri.conf.json  # 应用配置
└── .github/workflows/   # CI / 发布流水线
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

仓库已配置 GitHub Actions 工作流（`.github/workflows/release.yml`），推送版本 tag 后自动构建并上传各平台安装包。

**首次使用前**，在 GitHub 仓库设置中开启：

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

**发布步骤：**

1. 更新 `src-tauri/tauri.conf.json` 与 `package.json` 中的 `version`
2. 提交并推送到 `main`
3. 创建并推送 tag：

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

4. 在 [Actions](https://github.com/xichenx/Padora/actions) 等待构建完成
5. 在 [Releases](https://github.com/xichenx/Padora/releases) 打开草稿，确认安装包后点击 **Publish release**

也可在 Actions 页手动触发 **Release** 工作流（`workflow_dispatch`）。

## 反馈

欢迎通过 [Issues](https://github.com/xichenx/Padora/issues) 提交 Bug 报告或功能建议。
