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

> 当前版本为早期预览，**安装包未做代码签名**。Windows 可能提示「不安全」；macOS 需在「系统设置 → 隐私与安全性」中允许打开。见下方 [Windows 安装说明](#windows-安装说明)。

### Windows 安装说明（无证书 / 免费）

**买不起代码签名证书也可以正常发布和使用**，只是 Windows 会提示「发布者：未知」。这是预期行为，不是病毒。个人开源项目普遍如此。

你截图里的对话框要点：

> **不要点「删除」**，点 **「取消」**，然后按下面步骤操作。

#### 方法 A — 推荐（Edge / Chrome 下载）

1. 在 GitHub Releases 点击下载后，打开浏览器 **下载记录**（`Ctrl+J`）
2. 若显示已拦截，点 **⋯** → **保留** / **Keep anyway**
3. 打开 **下载** 文件夹，**右键** `Padora_*_x64-setup.exe` → **属性** → 勾选 **解除锁定** → 确定
4. 再双击安装；若仍弹 SmartScreen，点 **更多信息** → **仍要运行**

#### 方法 B — PowerShell 解除锁定（Win11 常用）

在 **下载** 文件夹按住 `Shift` + **右键** → **在此处打开 PowerShell 窗口**，执行：

```powershell
Unblock-File -Path ".\Padora_0.1.0_x64-setup.exe"
.\Padora_0.1.0_x64-setup.exe
```

把文件名换成你实际下载的版本。

#### 方法 C — 用 PowerShell 直接下载（绕过浏览器拦截）

```powershell
# 把 URL 换成 Release 里 exe 的真实下载链接
Invoke-WebRequest -Uri "https://github.com/xichenx/Padora/releases/download/v0.1.0/Padora_0.1.0_x64-setup.exe" -OutFile "$env:USERPROFILE\Downloads\Padora-setup.exe"
Unblock-File -Path "$env:USERPROFILE\Downloads\Padora-setup.exe"
Start-Process "$env:USERPROFILE\Downloads\Padora-setup.exe"
```

#### 方法 D — 从源码自己编译（完全跳过安装包）

适合开发者，本机编译的 exe 不会带「从互联网下载」标记：

```powershell
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri build
# 可执行文件在 src-tauri\target\release\ 和 bundle\nsis\ 下
```

需安装 [Node.js](https://nodejs.org/)、[pnpm](https://pnpm.io/)、[Rust](https://www.rust-lang.org/tools/install) 及 [Tauri Windows 依赖](https://v2.tauri.app/start/prerequisites/)。

#### 若安装后程序被安全中心删除

**Windows 安全中心** → **病毒和威胁防护** → **保护历史记录** → 找到 Padora → **允许** / **在设备上还原**。

---

### 开发者：没钱买证书怎么发布？

| 做法 | 说明 |
| --- | --- |
| **继续用 GitHub Releases** | 免费、主流做法；在 Release 说明里贴上文安装步骤 |
| **附上 SHA256 校验** | 让用户核对文件完整性，增加信任 |
| **开源 + 可编译** | 用户可自行 `pnpm tauri build` 验证源码 |
| **Scoop / WinGet 社区包** | 免费提交 manifest，部分用户更习惯包管理器安装（仍可能有一次 SmartScreen） |
| **代码签名证书** | 唯一能从根本减少 SmartScreen 的方式，需付费 |

**无法免费做到的事：** 让 Windows 显示「已验证的发布者」、完全去掉 SmartScreen。自签名证书也无效。

证书配置（有钱以后）：[docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)

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

也可在 Actions 页手动触发 **Release** 工作流（`workflow_dispatch`）。

### Windows 代码签名（可选）

未签名的 `.exe` / `.msi` 会被 SmartScreen 拦截。**要在打包时自动签名**，需先购买证书并配置 GitHub。

**完整步骤见：** [docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)

**快速清单：**

1. 购买 **Code Signing** 证书，导出 `.pfx`
2. GitHub **Secrets** 添加：`WINDOWS_CERTIFICATE`（Base64）、`WINDOWS_CERTIFICATE_PASSWORD`、`WINDOWS_CERTIFICATE_THUMBPRINT`
3. GitHub **Variables** 添加：`ENABLE_WINDOWS_SIGNING` = `true`
4. 推送 tag 或手动 Run Release 工作流

本地打包时在 `src-tauri/tauri.conf.json` 的 `bundle.windows` 中配置 `certificateThumbprint` 等字段，详见上文文档。

## 反馈

欢迎通过 [Issues](https://github.com/xichenx/Padora/issues) 提交 Bug 报告或功能建议。
