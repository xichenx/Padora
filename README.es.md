# Padora

Editor de Markdown multiplataforma inspirado en **Typora**, construido con **Tauri 2 + React + Rust**. Local primero, sin cuenta en la nube.

**Otros idiomas:** [English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

[Características](#características) · [Descarga](#descarga) · [Desarrollo](#desarrollo) · [Publicación](#publicación)

---

## Características

- **Tres modos de vista** — Vista previa, dividida y código fuente
- **Archivos locales** — Abrir un `.md` o una carpeta; barra lateral con lista y árbol
- **Markdown enriquecido** — Tablas GFM, listas de tareas, resaltado de sintaxis, KaTeX, HTML
- **Búsqueda** — En archivo (`Ctrl/Cmd+F`) y en carpeta (`Ctrl/Cmd+Shift+F`)
- **Esquema** — Generado desde encabezados; clic para saltar
- **Imágenes** — Arrastrar o pegar; se guardan en `assets/` e insertan automáticamente
- **Temas** — Claro y oscuro
- **i18n** — Interfaz en chino e inglés con menús nativos
- **Preferencias** — Tema, modo, ancho de barra lateral, último archivo, etc.

## Descarga

Instaladores en [GitHub Releases](https://github.com/xichenx/Padora/releases):

| Plataforma | Archivos |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Versiones preliminares **sin firma de código**. En macOS, permitir en Ajustes del sistema; en Windows, elegir **Ejecutar de todos modos** si SmartScreen advierte.

## Atajos de teclado

| Acción | Windows / Linux | macOS |
| --- | --- | --- |
| Nuevo archivo | `Ctrl+N` | `Cmd+N` |
| Abrir archivo | `Ctrl+O` | `Cmd+O` |
| Abrir carpeta | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Guardar | `Ctrl+S` | `Cmd+S` |
| Guardar como | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| Buscar | `Ctrl+F` | `Cmd+F` |
| Búsqueda global | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Vista previa | `Ctrl+1` | `Cmd+1` |
| Dividida | `Ctrl+2` | `Cmd+2` |
| Código fuente | `Ctrl+3` | `Cmd+3` |
| Barra lateral | `Ctrl+\` | `Cmd+\` |
| Tema | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Escritorio | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Renderizado | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust |

## Desarrollo

### Requisitos

- [Node.js](https://nodejs.org/) (LTS), [pnpm](https://pnpm.io/) 9+, [Rust](https://www.rust-lang.org/tools/install) stable
- Dependencias de Tauri — [documentación oficial](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu):**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Ejecutar

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev
```

### Compilar

```bash
pnpm tauri build
```

Salida: `src-tauri/target/release/bundle/`

## Publicación

1. Actualizar `version` en `src-tauri/tauri.conf.json` y `package.json`
2. `git tag v0.1.0 && git push origin v0.1.0`
3. Esperar [Actions](https://github.com/xichenx/Padora/actions) y publicar en [Releases](https://github.com/xichenx/Padora/releases)

Configuración del repositorio: **Settings → Actions → Workflow permissions → Read and write permissions**

## Comentarios

Informes y sugerencias: [Issues](https://github.com/xichenx/Padora/issues).
