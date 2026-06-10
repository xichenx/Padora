# Padora

Leitor e editor Markdown leve inspirado no **Typora** para Windows, macOS e Linux. Feito com **Tauri 2 + React + Rust** — local first, sem conta na nuvem.

<!-- README-I18N:START -->

[English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · **Português** · [Русский](README.ru.md)

<!-- README-I18N:END -->

[Recursos](#recursos) · [Download](#download) · [Desenvolvimento](#desenvolvimento) · [Publicação](#publicação)

---

## Recursos

- **Três modos de visualização** — Pré-visualização, dividido e código-fonte; alterne a qualquer momento durante a edição
- **Arquivos locais** — Abrir um `.md` ou pasta; barra lateral com arquivos abertos e árvore de diretórios
- **Markdown rico** — Tabelas GFM, listas de tarefas, realce de sintaxe, KaTeX, HTML
- **Busca** — No arquivo (`Ctrl/Cmd+F`) e na pasta (`Ctrl/Cmd+Shift+F`)
- **Sumário** — Gerado a partir de títulos; clique para ir
- **Imagens** — Arrastar ou colar; salvas em `assets/` ao lado do documento e inseridas automaticamente
- **Temas** — Claro e escuro
- **i18n** — Interface em chinês e inglês com menus nativos
- **Preferências** — Tema, modo, largura da barra lateral, último arquivo/pasta, etc.

## Download

Instaladores em [GitHub Releases](https://github.com/xichenx/Padora/releases):

| Plataforma | Arquivos |
| --- | --- |
| Windows | `.msi` / `.exe` |
| macOS (Apple Silicon) | `.dmg` (aarch64) |
| macOS (Intel) | `.dmg` (x86_64) |
| Linux | `.deb` / `.AppImage` |

> Builds de prévia **sem assinatura de código**. O Windows pode exibir aviso de «inseguro» — veja [Instalação no Windows](#instalação-no-windows). No macOS, permita o app em **Ajustes do Sistema → Privacidade e Segurança**.

### Instalação no Windows

Isso é **comportamento esperado**, não um build quebrado. O SmartScreen bloqueia apps não assinados baixados da internet (ex.: GitHub Releases) até o editor ganhar reputação ou usar certificado de assinatura de código.

**Prefira o instalador `.msi`** quando houver `.msi` e `-setup.exe`.

1. **Download no navegador** — Se Edge/Chrome bloquear o arquivo, clique em **Manter**.
2. **Desbloquear** — Clique direito no instalador → **Propriedades** → marque **Desbloquear** → OK.
3. **SmartScreen** — Dê duplo clique no instalador → na tela azul *«O Windows protegeu seu PC»*, **Mais informações** → **Executar assim mesmo**.
4. **Falso positivo do Defender** — **Segurança do Windows** → **Histórico de proteção** → permita ou restaure o Padora se em quarentena.

Para correção permanente, veja [Assinatura de código no Windows (opcional)](#assinatura-de-código-no-windows-opcional) abaixo.

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
| Shell desktop | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 · TypeScript · Vite 7 |
| Renderização | react-markdown · remark-gfm · KaTeX · highlight.js |
| Backend | Rust (E/S de arquivos, varredura de diretórios, importação de imagens, menu nativo) |

## Estrutura do projeto

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

## Desenvolvimento

### Requisitos

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) stable
- Dependências do Tauri por plataforma — [documentação oficial](https://v2.tauri.app/start/prerequisites/)

**Linux (Debian/Ubuntu) extras:**

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Instalar e executar

```bash
git clone https://github.com/xichenx/Padora.git
cd Padora
pnpm install
pnpm tauri dev      # Desktop dev mode
```

Pré-visualização só do frontend (navegador; sem APIs Tauri):

```bash
pnpm dev
```

### Compilar localmente

```bash
pnpm tauri build
```

Saída: `src-tauri/target/release/bundle/`.

### IDE recomendada

- [VS Code](https://code.visualstudio.com/)
- Extensão [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Publicação

GitHub Actions (`.github/workflows/release.yml`) compila e envia instaladores. **A versão de release** vem de uma de duas fontes:

| Gatilho | Origem da versão |
| --- | --- |
| **Push de tag** `v0.2.0` | Parseada da tag → compila **0.2.0**, cria Release **v0.2.0** |
| **Execução manual** (Actions → Release → Run workflow) | Digite a versão em **Release version** (ex.: `0.2.0`, sem prefixo `v`) |

Antes de qualquer método, atualize `version` em `src-tauri/tauri.conf.json` e `package.json` em `main` e faça commit. O CI também grava essa versão nos artefatos.

**Configuração única do repositório:**

> **Settings → Actions → General → Workflow permissions → Read and write permissions**

### Opção A — Push de tag (recomendado)

```bash
# 1. Atualize a versão em tauri.conf.json + package.json, commit, push main
git tag v0.2.0
git push origin v0.2.0
```

### Opção B — Workflow manual

1. Abra [Actions → Release](https://github.com/xichenx/Padora/actions/workflows/release.yml)
2. Clique **Run workflow**
3. Informe **Release version**, ex.: `0.2.0`
4. Execute

Depois abra o rascunho em [Releases](https://github.com/xichenx/Padora/releases), verifique os assets e clique **Publish release**.

### Assinatura de código no Windows (opcional)

Veja **[docs/windows-code-signing.zh-CN.md](docs/windows-code-signing.zh-CN.md)** (chinês, passo a passo) para o guia completo.

**Checklist:**

1. Compre um certificado **Code Signing**; exporte como `.pfx`
2. **Secrets** do GitHub: `WINDOWS_CERTIFICATE` (Base64), `WINDOWS_CERTIFICATE_PASSWORD`, `WINDOWS_CERTIFICATE_THUMBPRINT`
3. **Variable** do GitHub: `ENABLE_WINDOWS_SIGNING` = `true`
4. Push de tag ou execute o workflow Release

O workflow importa o certificado no runner Windows e o Tauri assina `.exe` / `.msi` durante `tauri build`.

## Feedback

Bugs e sugestões: [Issues](https://github.com/xichenx/Padora/issues).
