---
slug: /editor
---

# Editor Support

## Visual Studio Code

Install [Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton) from the VS Code Marketplace. The extension identifier is `yorun.skeleton`.

The extension provides:

- Skel syntax highlighting and the optional Skel Dark theme
- Recoverable syntax and workspace semantic diagnostics
- Related diagnostic locations and quick fixes
- Formatting, hover details, and decorator completion filtered for the element being decorated
- Deprecated declarations and elements in completion, hover, and symbol views
- Hierarchical document symbols and workspace symbol search
- Go to Definition and Find All References across workspace `.skel` files
- Rename for top-level declarations and their references
- Best-effort navigation while the current document contains a syntax error

Install `skelc` before opening a `.skel` file:

```bash
go install go.yorun.ai/skelc/cmd/skelc@latest
skelc version --output-format json
```

The extension requires skelc v0.10.3 or newer and starts `skelc lsp` from `PATH`. It is a thin client: parsing, formatting, diagnostics, completion, navigation, and rename are all provided by the compiler's language server rather than reimplemented in JavaScript.

## Configuration

| Setting | Default | Use |
| --- | --- | --- |
| `skelc.path` | `skelc` | Select the skelc executable. Changing it restarts the language server. |
| `skelc.trace.server` | `off` | Trace LSP traffic with `off`, `messages`, or `verbose`. |

Two commands are available from the Command Palette:

- `Skel: Restart Language Server`
- `Skel: Show Language Server Output`

If the server doesn't start, first run `skelc version --output-format json` in the same environment as the VS Code extension host. Set `skelc.path` to an absolute path when skelc isn't on that environment's `PATH`, then restart the language server and inspect its output channel.

## Remote Workspaces

The extension runs on the workspace side. In Remote SSH, WSL, or a Dev Container, install skelc in that remote environment or configure a remote value for `skelc.path`.

Virtual and untrusted workspaces aren't supported because the extension needs filesystem access and starts the configured executable. Untitled Skel documents are supported.

## JavaScript Syntax Highlighting

[`@yorun-ai/skel-highlight`](https://github.com/yorun-ai/skel-editor-support/tree/main/packages/highlight) is the JavaScript syntax-highlighting package for Skel. It provides the shared Skel grammar plus adapters for documentation sites, code viewers, and browser editors.

Install the package together with the highlighter your application already uses. The peer integrations are optional -- you don't need to install every supported highlighter. For PrismJS:

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

Choose the entry point that matches your host:

| Host | Install with the package | Import |
| --- | --- | --- |
| Shiki | `shiki` | `@yorun-ai/skel-highlight/shiki` |
| PrismJS or Refractor | `prismjs` | `@yorun-ai/skel-highlight/prism` |
| Highlight.js or Lowlight | `highlight.js` | `@yorun-ai/skel-highlight/highlightjs` |
| Monaco Editor | `monaco-editor` | `@yorun-ai/skel-highlight/monaco` |
| Starry Night | `@wooorm/starry-night` | `@yorun-ai/skel-highlight/starry-night` |
| CodeMirror 6 | `@codemirror/language` and `@codemirror/view` | `@yorun-ai/skel-highlight/codemirror` |
| TextMate-compatible tools | No adapter peer | `@yorun-ai/skel-highlight/textmate` |

The package recognizes Skel declarations, built-in types, decorators such as `@deprecated`, comments, and strings. It provides lexical highlighting only. Semantic diagnostics and language operations such as formatting, completion, navigation, and rename require `skelc lsp`.

The [package README](https://github.com/yorun-ai/skel-editor-support/tree/main/packages/highlight) contains registration examples for every adapter.

## Develop the Extension

The source lives in [`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support). From the repository root:

```bash
npm ci
npm run check
```

Open the repository in VS Code and press F5 to launch the Extension Development Host. The canonical TextMate grammar and frontend adapters live in `packages/highlight`; the VS Code client, language configuration, theme, and Marketplace package live in `editors/vscode`.

Continue to run `skelc check` in terminals and CI. Live editor diagnostics follow the same per-directory validation rules, while CI remains the reproducible check for the complete input set.
