# Padora

**Typora**에서 영감을 받은 가벼운 Markdown 리더 및 편집기(Windows, macOS, Linux). **Tauri 2 + React + Rust**로 구축. 로컬 우선, 클라우드 계정 불필요.

<!-- README-I18N:START -->

[English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · **한국어** · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

<!-- README-I18N:END -->

[기능](#기능) · [다운로드](#다운로드) · [개발](#개발) · [릴리스](#릴리스)

---

## 기능

- **세 가지 보기 모드** — 미리보기, 분할, 소스; 편집 중 언제든 전환
- **로컬 파일** — 단일 `.md` 파일 또는 폴더 열기; 사이드바에서 열린 파일 및 디렉터리 트리 관리
- **리치 Markdown** — GFM 표, 할 일 목록, 구문 강조, KaTeX 수식, HTML 임베드
- **검색** — 파일 내 찾기(`Ctrl/Cmd+F`) 및 폴더 전역 검색(`Ctrl/Cmd+Shift+F`)
- **개요** — 제목에서 자동 생성; 클릭하여 이동
- **이미지** — 드래그 앤 드롭 또는 붙여넣기; `assets/`에 저장 후 자동 삽입
- **테마** — 라이트 / 다크
- **i18n** — 중국어·영어 UI 및 네이티브 메뉴
- **환경설정** — 테마, 보기 모드, 사이드바 너비, 마지막으로 연 파일/폴더 등 저장

## 다운로드

[GitHub Releases](https://github.com/xichenx/Padora/releases)에서 설치 파일 다운로드:

| 플랫폼 | 파일 |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> 초기 미리보기 빌드는 **코드 서명 없음**. Windows에서 "안전하지 않음" 경고가 표시될 수 있음 — [Windows 설치](#windows-설치) 참조. macOS에서는 **시스템 설정 → 개인정보 보호 및 보안**에서 허용.

### Windows 설치

이는 **예상된 동작**이며, 빌드 오류가 아닙니다. SmartScreen은 인터넷(GitHub Releases 등)에서 다운로드한 서명되지 않은 앱을, 게시자 신뢰도가 쌓이거나 코드 서명 인증서를 사용할 때까지 차단합니다.

**`.msi`와 `-setup.exe`가 모두 있으면 `.msi` 설치 프로그램을 권장**합니다.

1. **브라우저 다운로드** — Edge/Chrome이 차단하면 **유지** 클릭.
2. **차단 해제** — 설치 파일 우클릭 → **속성** → **차단 해제** 체크 → 확인.
3. **SmartScreen** — 설치 파일 더블클릭 → 파란 "Windows가 PC를 보호했습니다" 화면에서 **자세한 정보** → **실행**.
4. **Defender 오탐** — **Windows 보안** → **보호 기록** → 격리된 Padora 허용 또는 복원.

영구 해결은 아래 [Windows 코드 서명(선택)](#windows-코드-서명선택) 참조.

## 키보드 단축키

| 동작 | Windows / Linux | macOS |
| --- | --- | --- |
| 새 파일 | `Ctrl+N` | `Cmd+N` |
| 파일 열기 | `Ctrl+O` | `Cmd+O` |
| 폴더 열기 | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| 저장 | `Ctrl+S` | `Cmd+S` |
| 다른 이름으로 저장 | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| 찾기 | `Ctrl+F` | `Cmd+F` |
| 전역 검색 | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| 미리보기 | `Ctrl+1` | `Cmd+1` |
| 분할 | `Ctrl+2` | `Cmd+2` |
| 소스 | `Ctrl+3` | `Cmd+3` |
| 사이드바 전환 | `Ctrl+\` | `Cmd+\` |
| 테마 전환 | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## 기술 스택

| 계층 | 기술 |
| --- | --- |
| 데스크톱 | [Tauri 2](https://v2.tauri.app/) |
| 프론트엔드 | React 19 · TypeScript · Vite 7 |
| 렌더링 | react-markdown · remark-gfm · KaTeX · highlight.js |
| 백엔드 | Rust(파일 I/O, 디렉터리 스캔, 이미지 가져오기, 네이티브 메뉴) |

## 프로젝트 구조

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

## 개발

### 사전 요구사항

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) stable
- 플랫폼별 Tauri 의존성 — [공식 문서](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu) 추가 패키지:**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### 설치 및 실행

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev      # Desktop dev mode
```

프론트엔드만(브라우저; Tauri API 없음):

```bash
pnpm dev
```

### 로컬 빌드

```bash
pnpm tauri build
```

출력: `src-tauri/target/release/bundle/`

### 권장 IDE

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) 확장
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 릴리스

GitHub Actions(`.github/workflows/release.yml`)가 설치 파일을 빌드·업로드합니다. **릴리스 버전**은 다음 중 하나에서 결정됩니다:

| 트리거 | 버전 출처 |
| --- | --- |
| **tag 푸시** `v0.2.0` | tag에서 파싱 → **0.2.0** 빌드, Release **v0.2.0** 생성 |
| **수동 실행**(Actions → Release → Run workflow) | **Release version**에 입력(예: `0.2.0`, `v` 접두사 없음) |

어느 방법이든 먼저 `main`에서 `src-tauri/tauri.conf.json`과 `package.json`의 `version`을 올리고 커밋하세요. CI도 해당 버전을 빌드 결과물에 기록합니다.

**일회성 저장소 설정:**

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

### 방법 A — tag 푸시(권장)

```bash
# 1. tauri.conf.json + package.json 버전 올리기, main 푸시
git tag v0.2.0
git push origin v0.2.0
```

### 방법 B — 수동 워크플로

1. [Actions → Release](https://github.com/xichenx/Padora/actions/workflows/release.yml) 열기
2. **Run workflow** 클릭
3. **Release version**에 예: `0.2.0` 입력
4. 실행

[Releases](https://github.com/xichenx/Padora/releases)에서 초안을 열고 자산을 확인한 뒤 **Publish release** 클릭.

### Windows 코드 서명(선택)

전체 가이드는 **[docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)**(중국어, 단계별) 참조.

**체크리스트:**

1. **Code Signing** 인증서 구매; `.pfx`로 내보내기
2. GitHub **Secrets**: `WINDOWS_CERTIFICATE` (Base64), `WINDOWS_CERTIFICATE_PASSWORD`, `WINDOWS_CERTIFICATE_THUMBPRINT`
3. GitHub **Variable**: `ENABLE_WINDOWS_SIGNING` = `true`
4. tag 푸시 또는 Release 워크플로 실행

워크플로는 Windows runner에서 인증서를 가져와 `tauri build` 시 `.exe` / `.msi`에 서명합니다.

## 피드백

버그 및 기능 요청: [Issues](https://github.com/xichenx/Padora/issues)
