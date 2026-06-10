# Padora

Éditeur et lecteur Markdown léger inspiré de **Typora** pour Windows, macOS et Linux. Construit avec **Tauri 2 + React + Rust** — local d'abord, sans compte cloud.

<!-- README-I18N:START -->

[English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · **Français** · [Deutsch](README.de.md) · [Português](README.pt-BR.md) · [Русский](README.ru.md)

<!-- README-I18N:END -->

[Fonctionnalités](#fonctionnalités) · [Téléchargement](#téléchargement) · [Développement](#développement) · [Publication](#publication)

---

## Fonctionnalités

- **Trois modes d'affichage** — Aperçu, partagé et source ; basculez à tout moment pendant l'édition
- **Fichiers locaux** — Ouvrir un `.md` ou un dossier ; barre latérale avec fichiers ouverts et arborescence
- **Markdown enrichi** — Tableaux GFM, listes de tâches, coloration syntaxique, KaTeX, HTML
- **Recherche** — Dans le fichier (`Ctrl/Cmd+F`) et dans le dossier (`Ctrl/Cmd+Shift+F`)
- **Plan** — Généré automatiquement depuis les titres ; clic pour naviguer
- **Images** — Glisser-déposer ou coller ; enregistrées dans `assets/` à côté du document et insérées automatiquement
- **Thèmes** — Clair et sombre
- **i18n** — Interface chinois et anglais avec menus natifs
- **Préférences** — Thème, mode, largeur de barre latérale, dernier fichier/dossier, etc.

## Téléchargement

Installeurs sur [GitHub Releases](https://github.com/xichenx/Padora/releases) :

| Plateforme | Fichiers |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Les builds de prévisualisation **ne sont pas signés**. Windows peut afficher un avertissement « non sécurisé » — voir [Installation sous Windows](#installation-sous-windows). Sous macOS, autorisez l'app dans **Réglages système → Confidentialité et sécurité**.

### Installation sous Windows

C'est **comportement attendu**, pas un build défectueux. SmartScreen bloque les apps non signées téléchargées depuis Internet (p. ex. GitHub Releases) jusqu'à ce que l'éditeur gagne en réputation ou utilise un certificat de signature de code.

**Préférez l'installateur `.msi`** lorsque `.msi` et `-setup.exe` sont disponibles.

1. **Téléchargement navigateur** — Si Edge/Chrome bloque le fichier, cliquez sur **Conserver**.
2. **Débloquer** — Clic droit sur l'installateur → **Propriétés** → cochez **Débloquer** → OK.
3. **SmartScreen** — Double-clic sur l'installateur → sur l'écran bleu *« Windows a protégé votre PC »*, **Informations complémentaires** → **Exécuter quand même**.
4. **Faux positif Defender** — **Sécurité Windows** → **Historique des protections** → autorisez ou restaurez Padora si mis en quarantaine.

Pour une solution durable, voir [Signature de code Windows (optionnel)](#signature-de-code-windows-optionnel) ci-dessous.

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
| Mode aperçu | `Ctrl+1` | `Cmd+1` |
| Mode partagé | `Ctrl+2` | `Cmd+2` |
| Mode source | `Ctrl+3` | `Cmd+3` |
| Barre latérale | `Ctrl+\` | `Cmd+\` |
| Thème | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## Stack technique

| Couche | Technologie |
| --- | --- |
| Shell bureau | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Rendu | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust (E/S fichiers, scan de répertoires, import d'images, menu natif) |

## Structure du projet

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

## Développement

### Prérequis

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) stable
- Dépendances Tauri par plateforme — [documentation officielle](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu) extras :**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Installer et lancer

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev      # Desktop dev mode
```

Aperçu frontend seul (navigateur ; sans API Tauri) :

```bash
pnpm dev
```

### Compiler localement

```bash
pnpm tauri build
```

Sortie : `src-tauri/target/release/bundle/`.

### IDE recommandé

- [VS Code](https://code.visualstudio.com/)
- Extension [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Publication

GitHub Actions (`.github/workflows/release.yml`) compile et publie les installateurs. **La version de release** provient de l'une de ces sources :

| Déclencheur | Origine de la version |
| --- | --- |
| **Push de tag** `v0.2.0` | Parsé depuis le tag → build **0.2.0**, crée Release **v0.2.0** |
| **Exécution manuelle** (Actions → Release → Run workflow) | Saisir la version dans **Release version** (p. ex. `0.2.0`, sans préfixe `v`) |

Avant l'une ou l'autre méthode, incrémentez `version` dans `src-tauri/tauri.conf.json` et `package.json` sur `main` et committez. CI écrit aussi cette version dans les artefacts.

**Paramètre unique du dépôt :**

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

### Option A — Push d'un tag (recommandé)

```bash
# 1. Incrémenter la version dans tauri.conf.json + package.json, commit, push main
git tag v0.2.0
git push origin v0.2.0
```

### Option B — Workflow manuel

1. Ouvrir [Actions → Release](https://github.com/xichenx/Padora/actions/workflows/release.yml)
2. Cliquer **Run workflow**
3. Saisir **Release version**, p. ex. `0.2.0`
4. Exécuter

Puis ouvrir le brouillon sur [Releases](https://github.com/xichenx/Padora/releases), vérifier les assets et cliquer **Publish release**.

### Signature de code Windows (optionnel)

Voir **[docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)** (chinois, pas à pas) pour le guide complet.

**Checklist :**

1. Acheter un certificat **Code Signing** ; exporter en `.pfx`
2. **Secrets** GitHub : `WINDOWS_CERTIFICATE` (Base64), `WINDOWS_CERTIFICATE_PASSWORD`, `WINDOWS_CERTIFICATE_THUMBPRINT`
3. **Variable** GitHub : `ENABLE_WINDOWS_SIGNING` = `true`
4. Push de tag ou exécuter le workflow Release

Le workflow importe le certificat sur le runner Windows et Tauri signe `.exe` / `.msi` pendant `tauri build`.

## Retours

Bugs et suggestions : [Issues](https://github.com/xichenx/Padora/issues).
