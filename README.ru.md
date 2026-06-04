# Padora

Лёгкий Markdown-редактор в духе **Typora** для Windows, macOS и Linux. **Tauri 2 + React + Rust** — локально, без облачного аккаунта.

**Другие языки:** [English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md)

[Возможности](#возможности) · [Скачать](#скачать) · [Разработка](#разработка) · [Релиз](#релиз)

---

## Возможности

- **Три режима** — Просмотр, разделённый и исходный код
- **Локальные файлы** — Один `.md` или папка; боковая панель со списком и деревом
- **Rich Markdown** — Таблицы GFM, списки задач, подсветка синтаксиса, KaTeX, HTML
- **Поиск** — В файле (`Ctrl/Cmd+F`) и по папке (`Ctrl/Cmd+Shift+F`)
- **Оглавление** — Автоматически из заголовков; клик для перехода
- **Изображения** — Перетаскивание или вставка; сохранение в `assets/` и автовставка
- **Темы** — Светлая и тёмная
- **i18n** — Китайский и английский интерфейс с нативными меню
- **Настройки** — Тема, режим, ширина панели, последний файл и др.

## Скачать

Установщики на [GitHub Releases](https://github.com/xichenx/Padora/releases):

| Платформа | Файлы |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Предварительные сборки **без подписи кода**. На macOS разрешите в «Системных настройках»; на Windows при SmartScreen выберите **Выполнить в любом случае**.

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
| Desktop | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Рендеринг | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust |

## Разработка

### Требования

- [Node.js](https://nodejs.org/) (LTS), [pnpm](https://pnpm.io/) 9+, [Rust](https://www.rust-lang.org/tools/install) stable
- Зависимости Tauri — [официальная документация](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu):**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Запуск

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev
```

### Сборка

```bash
pnpm tauri build
```

Результат: `src-tauri/target/release/bundle/`

## Релиз

1. Обновить `version` в `src-tauri/tauri.conf.json` и `package.json`
2. `git tag v0.1.0 && git push origin v0.1.0`
3. Дождаться [Actions](https://github.com/xichenx/Padora/actions), опубликовать на [Releases](https://github.com/xichenx/Padora/releases)

Настройка репозитория: **Settings → Actions → Workflow permissions → Read and write permissions**

## Обратная связь

Ошибки и предложения: [Issues](https://github.com/xichenx/Padora/issues).
