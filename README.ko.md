# Padora

**Typora**에서 영감을 받은 가벼운 Markdown 편집기(Windows / macOS / Linux). **Tauri 2 + React + Rust**로 제작. 로컬 우선, 클라우드 계정 불필요.

**다른 언어:** [English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

[기능](#기능) · [다운로드](#다운로드) · [개발](#개발) · [릴리스](#릴리스)

---

## 기능

- **3가지 보기** — 미리보기 / 분할 / 소스
- **로컬 파일** — 단일 `.md` 또는 폴더 열기; 사이드바 파일 목록 및 트리
- **풍부한 Markdown** — GFM 표, 할 일 목록, 구문 강조, KaTeX 수식, HTML
- **검색** — 파일 내 찾기(`Ctrl/Cmd+F`), 폴더 전체 검색(`Ctrl/Cmd+Shift+F`)
- **개요** — 제목 기반 자동 생성, 클릭하여 이동
- **이미지** — 드래그 앤 드롭 또는 붙여넣기; `assets/`에 저장 후 자동 삽입
- **테마** — 라이트 / 다크
- **다국어 UI** — 중국어·영어 및 네이티브 메뉴
- **설정 저장** — 테마, 보기 모드, 사이드바 너비, 마지막 파일 등

## 다운로드

[GitHub Releases](https://github.com/xichenx/Padora/releases)에서 설치 파일 다운로드:

| 플랫폼 | 형식 |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> 미리보기 빌드는 **코드 서명 없음**. macOS는 시스템 설정에서 허용, Windows SmartScreen은「실행」선택.

## 단축키

| 동작 | Windows / Linux | macOS |
| --- | --- | --- |
| 새 파일 | `Ctrl+N` | `Cmd+N` |
| 파일 열기 | `Ctrl+O` | `Cmd+O` |
| 폴더 열기 | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| 저장 | `Ctrl+S` | `Cmd+S` |
| 다른 이름으로 저장 | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| 찾기 | `Ctrl+F` | `Cmd+F` |
| 전체 검색 | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| 미리보기 | `Ctrl+1` | `Cmd+1` |
| 분할 | `Ctrl+2` | `Cmd+2` |
| 소스 | `Ctrl+3` | `Cmd+3` |
| 사이드바 | `Ctrl+\` | `Cmd+\` |
| 테마 | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## 기술 스택

| 계층 | 기술 |
| --- | --- |
| 데스크톱 | [Tauri 2](https://v2.tauri.app/) |
| 프론트엔드 | React 19 · TypeScript · Vite 7 |
| 렌더링 | react-markdown · remark-gfm · KaTeX · highlight.js |
| 백엔드 | Rust |

## 개발

### 요구 사항

- [Node.js](https://nodejs.org/) (LTS), [pnpm](https://pnpm.io/) 9+, [Rust](https://www.rust-lang.org/tools/install) stable
- [Tauri 사전 요구 사항](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu):**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### 실행

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev
```

### 빌드

```bash
pnpm tauri build
```

출력: `src-tauri/target/release/bundle/`

## 릴리스

1. `src-tauri/tauri.conf.json`, `package.json`의 `version` 업데이트
2. `git tag v0.1.0 && git push origin v0.1.0`
3. [Actions](https://github.com/xichenx/Padora/actions) 완료 후 [Releases](https://github.com/xichenx/Padora/releases)에서 게시

저장소 설정: **Settings → Actions → Workflow permissions → Read and write permissions**

## 피드백

[Issues](https://github.com/xichenx/Padora/issues)에 문의해 주세요.
