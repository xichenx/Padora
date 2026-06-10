# Padora

Лёгкий Markdown-ридер и редактор в духе **Typora** для Windows, macOS и Linux. На **Tauri 2 + React + Rust** — локально, без облачного аккаунта.

<!-- README-I18N:START -->

[English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · **Русский**

<!-- README-I18N:END -->

[Возможности](#возможности) · [Скачать](#скачать) · [Разработка](#разработка) · [Релиз](#релиз)

---

## Возможности

- **Три режима** — Просмотр, разделённый и исходный код; переключение в любой момент при редактировании
- **Локальные файлы** — Один `.md` или папка; боковая панель с открытыми файлами и деревом каталогов
- **Rich Markdown** — Таблицы GFM, списки задач, подсветка синтаксиса, KaTeX, HTML
- **Поиск** — В файле (`Ctrl/Cmd+F`) и по папке (`Ctrl/Cmd+Shift+F`)
- **Оглавление** — Автоматически из заголовков; клик для перехода
- **Изображения** — Перетаскивание или вставка; сохранение в `assets/` рядом с документом и автовставка
- **Темы** — Светлая и тёмная
- **i18n** — Китайский и английский интерфейс с нативными меню
- **Настройки** — Тема, режим, ширина панели, последний файл/папка и др.

## Скачать

Установщики на [GitHub Releases](https://github.com/xichenx/Padora/releases):

| Платформа | Файлы |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Предварительные сборки **без подписи кода**. Windows может показать предупреждение «небезопасно» — см. [Установка в Windows](#установка-в-windows). На macOS разрешите приложение в **Системные настройки → Конфиденциальность и безопасность**.

### Установка в Windows

Это **ожидаемое поведение**, а не сломанная сборка. SmartScreen блокирует неподписанные приложения, скачанные из интернета (например, GitHub Releases), пока издатель не наберёт репутацию или не использует сертификат подписи кода.

**Предпочитайте установщик `.msi`**, если доступны и `.msi`, и `-setup.exe`.

1. **Загрузка в браузере** — Если Edge/Chrome блокирует файл, нажмите **Сохранить**.
2. **Разблокировка** — ПКМ по установщику → **Свойства** → отметьте **Разблокировать** → OK.
3. **SmartScreen** — Двойной щелчок по установщику → на синем экране *«Система Windows защитила ваш компьютер»* **Подробнее** → **Выполнить в любом случае**.
4. **Ложное срабатывание Defender** — **Безопасность Windows** → **Журнал защиты** → разрешите или восстановите Padora, если в карантине.

Постоянное решение — см. [Подпись кода Windows (необязательно)](#подпись-кода-windows-необязательно) ниже.

## Горячие клавиши

| Действие | Windows / Linux | macOS |
| --- | --- | --- |
| Новый файл | `Ctrl+N` | `Cmd+N` |
| Открыть файл | `Ctrl+O` | `Cmd+O` |
| Открыть папку | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Сохранить | `Ctrl+S` | `Cmd+S` |
| Сохранить как | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| Найти | `Ctrl+F` | `Cmd+F` |
| Глобальный поиск | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Просмотр | `Ctrl+1` | `Cmd+1` |
| Разделённый | `Ctrl+2` | `Cmd+2` |
| Исходник | `Ctrl+3` | `Cmd+3` |
| Боковая панель | `Ctrl+\` | `Cmd+\` |
| Тема | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## Стек

| Слой | Технология |
| --- | --- |
| Desktop shell | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Рендеринг | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust (файловый I/O, сканирование каталогов, импорт изображений, нативное меню) |

## Структура проекта

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

## Разработка

### Требования

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) stable
- Зависимости Tauri по платформе — [официальная документация](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu) дополнительно:**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Установка и запуск

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev      # Desktop dev mode
```

Только frontend (браузер; без API Tauri):

```bash
pnpm dev
```

### Локальная сборка

```bash
pnpm tauri build
```

Результат: `src-tauri/target/release/bundle/`.

### Рекомендуемая IDE

- [VS Code](https://code.visualstudio.com/)
- Расширение [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Релиз

GitHub Actions (`.github/workflows/release.yml`) собирает и загружает установщики. **Версия релиза** берётся из одного из двух источников:

| Триггер | Откуда версия |
| --- | --- |
| **Push тега** `v0.2.0` | Из тега → сборка **0.2.0**, Release **v0.2.0** |
| **Ручной запуск** (Actions → Release → Run workflow) | Ввод в **Release version** (напр. `0.2.0`, без префикса `v`) |

Перед любым способом обновите `version` в `src-tauri/tauri.conf.json` и `package.json` на `main` и закоммитьте. CI также записывает эту версию в артефакты.

**Однократная настройка репозитория:**

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

### Вариант A — Push тега (рекомендуется)

```bash
# 1. Обновите version в tauri.conf.json + package.json, commit, push main
git tag v0.2.0
git push origin v0.2.0
```

### Вариант B — Ручной workflow

1. Откройте [Actions → Release](https://github.com/xichenx/Padora/actions/workflows/release.yml)
2. Нажмите **Run workflow**
3. Введите **Release version**, напр. `0.2.0`
4. Запустите

Затем откройте черновик на [Releases](https://github.com/xichenx/Padora/releases), проверьте assets и нажмите **Publish release**.

### Подпись кода Windows (необязательно)

Полное руководство: **[docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)** (китайский, пошагово).

**Чеклист:**

1. Купите сертификат **Code Signing**; экспортируйте как `.pfx`
2. **Secrets** GitHub: `WINDOWS_CERTIFICATE` (Base64), `WINDOWS_CERTIFICATE_PASSWORD`, `WINDOWS_CERTIFICATE_THUMBPRINT`
3. **Variable** GitHub: `ENABLE_WINDOWS_SIGNING` = `true`
4. Push тега или запуск Release workflow

Workflow импортирует сертификат на Windows runner, Tauri подписывает `.exe` / `.msi` при `tauri build`.

## Обратная связь

Ошибки и предложения: [Issues](https://github.com/xichenx/Padora/issues).
