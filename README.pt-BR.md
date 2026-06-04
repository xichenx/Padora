# Padora

Editor Markdown multiplataforma inspirado no **Typora**, feito com **Tauri 2 + React + Rust**. Local first, sem conta na nuvem.

**Outros idiomas:** [English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

[Recursos](#recursos) · [Download](#download) · [Desenvolvimento](#desenvolvimento) · [Publicação](#publicação)

---

## Recursos

- **Três modos de visualização** — Pré-visualização, dividido e código-fonte
- **Arquivos locais** — Abrir um `.md` ou pasta; barra lateral com lista e árvore
- **Markdown rico** — Tabelas GFM, listas de tarefas, realce de sintaxe, KaTeX, HTML
- **Busca** — No arquivo (`Ctrl/Cmd+F`) e na pasta (`Ctrl/Cmd+Shift+F`)
- **Sumário** — Gerado a partir de títulos; clique para ir
- **Imagens** — Arrastar ou colar; salvas em `assets/` e inseridas automaticamente
- **Temas** — Claro e escuro
- **i18n** — Interface em chinês e inglês com menus nativos
- **Preferências** — Tema, modo, largura da barra lateral, último arquivo, etc.

## Download

Instaladores em [GitHub Releases](https://github.com/xichenx/Padora/releases):

| Plataforma | Arquivos |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Builds de prévia **sem assinatura de código**. No macOS, permitir nas Configurações do Sistema; no Windows, escolher **Executar mesmo assim** se o SmartScreen avisar.

## Atalhos de teclado

| Ação | Windows / Linux | macOS |
| --- | --- | --- |
| Novo arquivo | `Ctrl+N` | `Cmd+N` |
| Abrir arquivo | `Ctrl+O` | `Cmd+O` |
| Abrir pasta | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Salvar | `Ctrl+S` | `Cmd+S` |
| Salvar como | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| Buscar | `Ctrl+F` | `Cmd+F` |
| Busca global | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Pré-visualização | `Ctrl+1` | `Cmd+1` |
| Dividido | `Ctrl+2` | `Cmd+2` |
| Código-fonte | `Ctrl+3` | `Cmd+3` |
| Barra lateral | `Ctrl+\` | `Cmd+\` |
| Tema | `Ctrl+Shift+L` | `Cmd+Shift+L` |

## Stack tecnológico

| Camada | Tecnologia |
| --- | --- |
| Desktop | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Renderização | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust |

## Desenvolvimento

### Requisitos

- [Node.js](https://nodejs.org/) (LTS), [pnpm](https://pnpm.io/) 9+, [Rust](https://www.rust-lang.org/tools/install) stable
- Dependências do Tauri — [documentação oficial](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu):**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Executar

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

Saída: `src-tauri/target/release/bundle/`

## Publicação

1. Atualizar `version` em `src-tauri/tauri.conf.json` e `package.json`
2. `git tag v0.1.0 && git push origin v0.1.0`
3. Aguardar [Actions](https://github.com/xichenx/Padora/actions) e publicar em [Releases](https://github.com/xichenx/Padora/releases)

Configuração do repositório: **Settings → Actions → Workflow permissions → Read and write permissions**

## Feedback

Bugs e sugestões: [Issues](https://github.com/xichenx/Padora/issues).
