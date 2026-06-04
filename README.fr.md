# Padora

Éditeur Markdown multiplateforme inspiré de **Typora**, basé sur **Tauri 2 + React + Rust**. Local d'abord, sans compte cloud.

**Autres langues :** [English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

[Fonctionnalités](#fonctionnalités) · [Téléchargement](#téléchargement) · [Développement](#développement) · [Publication](#publication)

---

## Fonctionnalités

- **Trois modes d'affichage** — Aperçu, partagé et source
- **Fichiers locaux** — Ouvrir un `.md` ou un dossier ; barre latérale avec liste et arborescence
- **Markdown riche** — Tableaux GFM, listes de tâches, coloration syntaxique, KaTeX, HTML
- **Recherche** — Dans le fichier (`Ctrl/Cmd+F`) et dans le dossier (`Ctrl/Cmd+Shift+F`)
- **Plan** — Généré à partir des titres ; clic pour naviguer
- **Images** — Glisser-déposer ou coller ; enregistrées dans `assets/` et insérées automatiquement
- **Thèmes** — Clair et sombre
- **i18n** — Interface chinois / anglais avec menus natifs
- **Préférences** — Thème, mode, largeur de barre latérale, dernier fichier, etc.

## Téléchargement

Installateurs sur [GitHub Releases](https://github.com/xichenx/Padora/releases) :

| Plateforme | Fichiers |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Versions préliminaires **non signées**. Sur macOS, autoriser dans Réglages système ; sur Windows, choisir **Exécuter quand même** si SmartScreen avertit.

## Raccourcis clavier

| Action | Windows / Linux | macOS |
| --- | --- | --- |
| Nouveau fichier | `Ctrl+N` | `Cmd+N` |
| Ouvrir un fichier | `Ctrl+O` | `Cmd+O` |
| Ouvrir un dossier | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Enregistrer | `Ctrl+S` | `Cmd+S` |
| Enregistrer sous | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| Rechercher | `Ctrl+F` | `Cmd+F` |
| Recherche globale | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Aperçu | `Ctrl+1` | `Cmd+1` |
| Partagé | `Ctrl+2` | `Cmd+2` |
| Source | `Ctrl+3` | `Cmd+3` |
| Barre latérale | `Ctrl+\` | `Cmd+\` |
| Thème | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## Stack technique

| Couche | Technologie |
| --- | --- |
| Bureau | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Rendu | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust |

## Développement

### Prérequis

- [Node.js](https://nodejs.org/) (LTS), [pnpm](https://pnpm.io/) 9+, [Rust](https://www.rust-lang.org/tools/install) stable
- Dépendances Tauri — [documentation officielle](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu) :**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Lancer

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev
```

### Compiler

```bash
pnpm tauri build
```

Sortie : `src-tauri/target/release/bundle/`

## Publication

1. Mettre à jour `version` dans `src-tauri/tauri.conf.json` et `package.json`
2. `git tag v0.1.0 && git push origin v0.1.0`
3. Attendre [Actions](https://github.com/xichenx/Padora/actions), publier sur [Releases](https://github.com/xichenx/Padora/releases)

Paramètre du dépôt : **Settings → Actions → Workflow permissions → Read and write permissions**

## Retours

Bugs et suggestions : [Issues](https://github.com/xichenx/Padora/issues).
