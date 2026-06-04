# Padora

Leichter **Typora**-inspirierter Markdown-Editor für Windows, macOS und Linux. **Tauri 2 + React + Rust** — lokal first, kein Cloud-Konto nötig.

**Weitere Sprachen:** [English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

[Funktionen](#funktionen) · [Download](#download) · [Entwicklung](#entwicklung) · [Release](#release)

---

## Funktionen

- **Drei Ansichtsmodi** — Vorschau, geteilt und Quelltext
- **Lokale Dateien** — Einzelne `.md`-Datei oder Ordner öffnen; Seitenleiste mit Liste und Baum
- **Rich Markdown** — GFM-Tabellen, Aufgabenlisten, Syntax-Highlighting, KaTeX, HTML
- **Suche** — In der Datei (`Ctrl/Cmd+F`) und im Ordner (`Ctrl/Cmd+Shift+F`)
- **Gliederung** — Automatisch aus Überschriften; Klick zum Springen
- **Bilder** — Drag & Drop oder Einfügen; Speicherung in `assets/` mit automatischer Einbindung
- **Themes** — Hell und dunkel
- **i18n** — Chinesische und englische UI mit nativen Menüs
- **Einstellungen** — Theme, Modus, Seitenleistenbreite, zuletzt geöffnete Datei usw.

## Download

Installer auf [GitHub Releases](https://github.com/xichenx/Padora/releases):

| Plattform | Dateien |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Vorschau-Builds **ohne Codesignatur**. Unter macOS in den Systemeinstellungen erlauben; unter Windows bei SmartScreen **Trotzdem ausführen** wählen.

## Tastenkürzel

| Aktion | Windows / Linux | macOS |
| --- | --- | --- |
| Neue Datei | `Ctrl+N` | `Cmd+N` |
| Datei öffnen | `Ctrl+O` | `Cmd+O` |
| Ordner öffnen | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Speichern | `Ctrl+S` | `Cmd+S` |
| Speichern unter | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| Suchen | `Ctrl+F` | `Cmd+F` |
| Globale Suche | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Vorschau | `Ctrl+1` | `Cmd+1` |
| Geteilt | `Ctrl+2` | `Cmd+2` |
| Quelltext | `Ctrl+3` | `Cmd+3` |
| Seitenleiste | `Ctrl+\` | `Cmd+\` |
| Theme | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## Tech-Stack

| Schicht | Technologie |
| --- | --- |
| Desktop | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Rendering | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust |

## Entwicklung

### Voraussetzungen

- [Node.js](https://nodejs.org/) (LTS), [pnpm](https://pnpm.io/) 9+, [Rust](https://www.rust-lang.org/tools/install) stable
- Tauri-Abhängigkeiten — [offizielle Doku](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu):**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Starten

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev
```

### Bauen

```bash
pnpm tauri build
```

Ausgabe: `src-tauri/target/release/bundle/`

## Release

1. `version` in `src-tauri/tauri.conf.json` und `package.json` erhöhen
2. `git tag v0.1.0 && git push origin v0.1.0`
3. [Actions](https://github.com/xichenx/Padora/actions) abwarten, auf [Releases](https://github.com/xichenx/Padora/releases) veröffentlichen

Repository-Einstellung: **Settings → Actions → Workflow permissions → Read and write permissions**

## Feedback

Fehler und Vorschläge: [Issues](https://github.com/xichenx/Padora/issues).
