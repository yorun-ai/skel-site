---
slug: /editor
---

# Editor and Syntax Highlighting

Skel provides two complementary editor tools. Use the VS Code extension when you author contracts, and use the JavaScript package when your application needs to render or edit Skel source.

| Goal | Choose | What it provides |
| --- | --- | --- |
| Edit `.skel` files in VS Code | [Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton) | Syntax highlighting plus diagnostics, completion, formatting, navigation, and other language features from `skelc lsp` |
| Display Skel in a documentation site, code viewer, or browser editor | [`@yorun-ai/skel-highlight`](https://www.npmjs.com/package/@yorun-ai/skel-highlight) | The shared Skel grammar and adapters for popular JavaScript highlighters |

The VS Code extension and TextMate-based adapters share the canonical Skel grammar; the other adapters reuse the same language vocabulary. Semantic features come from `skelc lsp`, while the highlighting package performs lexical highlighting only.

## VS Code Extension

The extension identifier is `yorun.skeleton`. It does not bundle the compiler, so install skelc in the same environment where the VS Code extension host runs.

### Quick Setup

1. Install skelc v0.10.3 or newer and confirm that VS Code can find it:

   ```bash
   go install go.yorun.ai/skelc/cmd/skelc@latest
   skelc version --output-format json
   ```

2. Install [Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton) from the VS Code Marketplace.
3. Open a folder containing `.skel` files. The extension starts `skelc lsp` automatically.
4. If the server does not start, set `skelc.path` to the absolute path of the skelc executable and run `Skel: Restart Language Server`.

Once connected, the extension provides:

- Skel syntax highlighting and the optional Skel Dark theme
- Recoverable syntax and source-directory-scoped semantic diagnostics
- Related diagnostic locations and quick fixes
- Formatting, hover details, and decorator completion filtered for the element being decorated
- Deprecated declarations and elements in completion, hover, and symbol views
- Hierarchical document symbols and workspace symbol search
- Go to Definition and Find All References across workspace `.skel` files
- Rename for top-level declarations and their references
- Best-effort navigation while the current document contains a syntax error

The extension is a thin client: parsing, formatting, diagnostics, completion, navigation, and rename are all provided by the compiler's language server rather than reimplemented in JavaScript.

### Configuration

| Setting | Default | Use |
| --- | --- | --- |
| `skelc.path` | `skelc` | Select the skelc executable. Changing it restarts the language server. |
| `skelc.trace.server` | `off` | Trace LSP traffic with `off`, `messages`, or `verbose`. |

The Command Palette provides:

- `Skel: Restart Language Server`
- `Skel: Show Language Server Output`

For startup problems, run `skelc version --output-format json` in the extension host environment first. Then inspect the language-server output and enable `skelc.trace.server` when protocol details are needed.

### Remote Workspaces

The extension runs on the workspace side. In Remote SSH, WSL, or a Dev Container, install skelc in that remote environment or configure a remote value for `skelc.path`.

Virtual and untrusted workspaces are not supported because the extension needs filesystem access and starts the configured executable. Untitled Skel documents are supported.

## JavaScript Syntax Highlighting

Use [`@yorun-ai/skel-highlight`](https://www.npmjs.com/package/@yorun-ai/skel-highlight) when a website or application needs to display Skel source. Install only the package and the highlighter your application already uses; all highlighter peer dependencies are optional.

### Choose an Integration

| Host | Install with the package | Import |
| --- | --- | --- |
| Shiki | `shiki` | `@yorun-ai/skel-highlight/shiki` |
| PrismJS or Refractor | `prismjs` | `@yorun-ai/skel-highlight/prism` |
| Highlight.js or Lowlight | `highlight.js` | `@yorun-ai/skel-highlight/highlightjs` |
| Monaco Editor | `monaco-editor` | `@yorun-ai/skel-highlight/monaco` |
| Starry Night | `@wooorm/starry-night` | `@yorun-ai/skel-highlight/starry-night` |
| CodeMirror 6 | `@codemirror/language` and `@codemirror/view` | `@yorun-ai/skel-highlight/codemirror` |
| TextMate-compatible tools | No adapter peer | `@yorun-ai/skel-highlight/textmate` |

The package recognizes Skel declarations, built-in types, decorators such as `@deprecated`, comments, and strings.

### Quick Start with PrismJS

Install the package and PrismJS:

```bash
npm install prismjs @yorun-ai/skel-highlight
```

Register Skel once during application startup:

```js
import Prism from 'prismjs'
import skel, {
  registerSkelPrism,
} from '@yorun-ai/skel-highlight/prism'

registerSkelPrism(Prism)

const html = Prism.highlight(
  'domain commerce.order',
  skel,
  'skel',
)
```

The [package README](https://github.com/yorun-ai/skel-editor-support/tree/main/packages/highlight) contains complete examples for Shiki, PrismJS, Highlight.js, Monaco Editor, Starry Night, CodeMirror 6, and TextMate consumers.

### Highlighting and Language Intelligence

The package provides lexical highlighting only. It does not parse or validate contracts, and adding the Monaco or CodeMirror adapter does not automatically enable diagnostics or completion. Those features require a client connected to `skelc lsp`.

## Develop the Integrations

The extension and highlighting package live in [`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support). From the repository root:

```bash
npm ci
npm run check
```

Open the repository in VS Code and press F5 to launch the Extension Development Host. The canonical TextMate grammar and frontend adapters live in `packages/highlight`; the VS Code client, language configuration, theme, and Marketplace package live in `editors/vscode`.

Continue to run `skelc check` in terminals and CI. Live editor diagnostics follow the same per-directory validation rules, while CI remains the reproducible check for the complete input set.
