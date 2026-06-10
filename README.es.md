# Padora

Editor de Markdown inspirado en **Typora** para Windows, macOS y Linux. Construido con **Tauri 2 + React + Rust** — local primero, sin cuenta en la nube.

<!-- README-I18N:START -->

[English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **Español** · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

<!-- README-I18N:END -->

[Características](#características) · [Descarga](#descarga) · [Desarrollo](#desarrollo) · [Publicación](#publicación)

---

## Características

- **Tres modos de vista** — Vista previa, dividida y código fuente; cambia en cualquier momento mientras editas
- **Archivos locales** — Abrir un `.md` o una carpeta; barra lateral con archivos abiertos y árbol de directorios
- **Markdown enriquecido** — Tablas GFM, listas de tareas, resaltado de sintaxis, KaTeX, HTML
- **Búsqueda** — En archivo (`Ctrl/Cmd+F`) y en carpeta (`Ctrl/Cmd+Shift+F`)
- **Esquema** — Generado desde encabezados; clic para saltar
- **Imágenes** — Arrastrar o pegar; se guardan en `assets/` junto al documento e insertan automáticamente
- **Temas** — Claro y oscuro
- **i18n** — Interfaz en chino e inglés con menús nativos
- **Preferencias** — Tema, modo, ancho de barra lateral, último archivo/carpeta, etc.

## Descarga

Instaladores en [GitHub Releases](https://github.com/xichenx/Padora/releases):

| Plataforma | Archivos |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Las compilaciones de vista previa **no están firmadas**. Windows puede mostrar una advertencia de «no seguro» — consulta [Instalación en Windows](#instalación-en-windows). En macOS, permite la app en **Ajustes del sistema → Privacidad y seguridad**.

### Instalación en Windows

Es **comportamiento esperado**, no un build roto. SmartScreen bloquea apps sin firmar descargadas de internet (p. ej. GitHub Releases) hasta que el editor gane reputación o use un certificado de firma de código.

**Prefiere el instalador `.msi`** cuando haya `.msi` y `-setup.exe`.

1. **Descarga del navegador** — Si Edge/Chrome bloquea el archivo, pulsa **Conservar**.
2. **Desbloquear** — Clic derecho en el instalador → **Propiedades** → marca **Desbloquear** → Aceptar.
3. **SmartScreen** — Doble clic en el instalador → en la pantalla azul *«Windows protegió tu PC»*, **Más información** → **Ejecutar de todos modos**.
4. **Falso positivo de Defender** — **Seguridad de Windows** → **Historial de protección** → permite o restaura Padora si fue en cuarentena.

Para una solución permanente, consulta [Firma de código en Windows (opcional)](#firma-de-código-en-windows-opcional) más abajo.

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
| Vista dividida | `Ctrl+2` | `Cmd+2` |
| Código fuente | `Ctrl+3` | `Cmd+3` |
| Barra lateral | `Ctrl+\` | `Cmd+\` |
| Tema | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Shell de escritorio | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Renderizado | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust (E/S de archivos, escaneo de directorios, importación de imágenes, menú nativo) |

## Estructura del proyecto

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

## Desarrollo

### Requisitos previos

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) stable
- Dependencias de Tauri por plataforma — [documentación oficial](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu) extras:**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Instalar y ejecutar

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev      # Desktop dev mode
```

Vista previa solo frontend (navegador; sin APIs de Tauri):

```bash
pnpm dev
```

### Compilar localmente

```bash
pnpm tauri build
```

Salida: `src-tauri/target/release/bundle/`.

### IDE recomendado

- [VS Code](https://code.visualstudio.com/)
- Extensión [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Publicación

GitHub Actions (`.github/workflows/release.yml`) compila y sube instaladores. **La versión de release** proviene de una de dos fuentes:

| Disparador | Origen de la versión |
| --- | --- |
| **Push de tag** `v0.2.0` | Parseado del tag → compila **0.2.0**, crea Release **v0.2.0** |
| **Ejecución manual** (Actions → Release → Run workflow) | Escribes la versión en **Release version** (p. ej. `0.2.0`, sin prefijo `v`) |

Antes de cualquier método, sube `version` en `src-tauri/tauri.conf.json` y `package.json` en `main` y haz commit. CI también escribe esa versión en los artefactos.

**Configuración única del repositorio:**

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

### Opción A — Push de tag (recomendado)

```bash
# 1. Sube la versión en tauri.conf.json + package.json, commit, push main
git tag v0.2.0
git push origin v0.2.0
```

### Opción B — Workflow manual

1. Abre [Actions → Release](https://github.com/xichenx/Padora/actions/workflows/release.yml)
2. Clic en **Run workflow**
3. Introduce **Release version**, p. ej. `0.2.0`
4. Ejecutar

Luego abre el borrador en [Releases](https://github.com/xichenx/Padora/releases), verifica los assets y pulsa **Publish release**.

### Firma de código en Windows (opcional)

Consulta **[docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)** (chino, paso a paso) para la guía completa.

**Lista de comprobación:**

1. Compra un certificado **Code Signing**; expórtalo como `.pfx`
2. **Secrets** de GitHub: `WINDOWS_CERTIFICATE` (Base64), `WINDOWS_CERTIFICATE_PASSWORD`, `WINDOWS_CERTIFICATE_THUMBPRINT`
3. **Variable** de GitHub: `ENABLE_WINDOWS_SIGNING` = `true`
4. Push de tag o ejecuta el workflow Release

El workflow importa el certificado en el runner de Windows y Tauri firma `.exe` / `.msi` durante `tauri build`.

## Comentarios

Informes de errores y solicitudes de funciones: [Issues](https://github.com/xichenx/Padora/issues).
