# Padora

Leichter **Typora**-inspirierter Markdown-Reader und -Editor für Windows, macOS und Linux. Mit **Tauri 2 + React + Rust** — lokal first, kein Cloud-Konto nötig.

<!-- README-I18N:START -->

[English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · **Deutsch** · [Português](README.pt-BR.md) · [Русский](README.ru.md)

<!-- README-I18N:END -->

[Funktionen](#funktionen) · [Download](#download) · [Entwicklung](#entwicklung) · [Release](#release)

---

## Funktionen

- **Drei Ansichtsmodi** — Vorschau, geteilt und Quelltext; jederzeit beim Bearbeiten wechseln
- **Lokale Dateien** — Einzelne `.md`-Datei oder Ordner öffnen; Seitenleiste mit geöffneten Dateien und Verzeichnisbaum
- **Rich Markdown** — GFM-Tabellen, Aufgabenlisten, Syntax-Highlighting, KaTeX, HTML
- **Suche** — In der Datei (`Ctrl/Cmd+F`) und im Ordner (`Ctrl/Cmd+Shift+F`)
- **Gliederung** — Automatisch aus Überschriften; Klick zum Springen
- **Bilder** — Drag & Drop oder Einfügen; Speicherung in `assets/` neben dem Dokument mit automatischer Einbindung
- **Themes** — Hell und dunkel
- **i18n** — Chinesische und englische UI mit nativen Menüs
- **Einstellungen** — Theme, Modus, Seitenleistenbreite, zuletzt geöffnete Datei/Ordner usw.

## Download

Installer auf [GitHub Releases](https://github.com/xichenx/Padora/releases):

| Plattform | Dateien |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Vorschau-Builds **ohne Codesignatur**. Windows kann eine „unsicher“-Warnung anzeigen — siehe [Installation unter Windows](#installation-unter-windows). Unter macOS die App unter **Systemeinstellungen → Datenschutz & Sicherheit** erlauben.

### Installation unter Windows

Das ist **erwartetes Verhalten**, kein defekter Build. SmartScreen blockiert unsignierte Apps aus dem Internet (z. B. GitHub Releases), bis der Herausgeber Reputation aufbaut oder ein Code-Signing-Zertifikat nutzt.

**Bevorzuge den `.msi`-Installer**, wenn sowohl `.msi` als auch `-setup.exe` verfügbar sind.

1. **Browser-Download** — Wenn Edge/Chrome die Datei blockiert, **Behalten** klicken.
2. **Entsperren** — Rechtsklick auf Installer → **Eigenschaften** → **Zulassen** aktivieren → OK.
3. **SmartScreen** — Installer doppelklicken → auf dem blauen Bildschirm *„Windows hat Ihren PC geschützt“* **Weitere Informationen** → **Trotzdem ausführen**.
4. **Defender-Falschmeldung** — **Windows-Sicherheit** → **Schutzverlauf** → Padora zulassen oder wiederherstellen, falls in Quarantäne.

Für eine dauerhafte Lösung siehe [Windows-Code-Signing (optional)](#windows-code-signing-optional) unten.

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
| Desktop-Shell | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Rendering | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust (Datei-I/O, Verzeichnisscan, Bildimport, natives Menü) |

## Projektstruktur

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

## Entwicklung

### Voraussetzungen

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) stable
- Tauri-Abhängigkeiten pro Plattform — [offizielle Doku](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu) extras:**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Installieren und starten

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev      # Desktop dev mode
```

Nur Frontend (Browser; keine Tauri-APIs):

```bash
pnpm dev
```

### Lokal bauen

```bash
pnpm tauri build
```

Ausgabe: `src-tauri/target/release/bundle/`.

### Empfohlene IDE

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)-Erweiterung
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Release

GitHub Actions (`.github/workflows/release.yml`) baut und lädt Installer hoch. **Die Release-Version** kommt aus einer von zwei Quellen:

| Auslöser | Herkunft der Version |
| --- | --- |
| **Tag-Push** `v0.2.0` | Aus Tag geparst → baut **0.2.0**, erstellt Release **v0.2.0** |
| **Manueller Lauf** (Actions → Release → Run workflow) | Version in **Release version** eingeben (z. B. `0.2.0`, ohne `v`) |

Vor beiden Methoden `version` in `src-tauri/tauri.conf.json` und `package.json` auf `main` erhöhen und committen. CI schreibt diese Version auch in die Build-Artefakte.

**Einmalige Repository-Einstellung:**

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

### Option A — Tag pushen (empfohlen)

```bash
# 1. Version in tauri.conf.json + package.json erhöhen, commit, push main
git tag v0.2.0
git push origin v0.2.0
```

### Option B — Manueller Workflow

1. [Actions → Release](https://github.com/xichenx/Padora/actions/workflows/release.yml) öffnen
2. **Run workflow** klicken
3. **Release version** eingeben, z. B. `0.2.0`
4. Ausführen

Dann den Entwurf auf [Releases](https://github.com/xichenx/Padora/releases) öffnen, Assets prüfen und **Publish release** klicken.

### Windows-Code-Signing (optional)

Siehe **[docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)** (Chinesisch, Schritt für Schritt) für die vollständige Anleitung.

**Checkliste:**

1. **Code-Signing**-Zertifikat kaufen; als `.pfx` exportieren
2. GitHub **Secrets**: `WINDOWS_CERTIFICATE` (Base64), `WINDOWS_CERTIFICATE_PASSWORD`, `WINDOWS_CERTIFICATE_THUMBPRINT`
3. GitHub **Variable**: `ENABLE_WINDOWS_SIGNING` = `true`
4. Tag pushen oder Release-Workflow ausführen

Der Workflow importiert das Zertifikat auf dem Windows-Runner und Tauri signiert `.exe` / `.msi` während `tauri build`.

## Feedback

Fehler und Vorschläge: [Issues](https://github.com/xichenx/Padora/issues).
