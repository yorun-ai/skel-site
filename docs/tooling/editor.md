---
slug: /editor
---

# VS Code Extension

[Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton) adds Skel syntax highlighting and language features to VS Code. The extension identifier is `yorun.skeleton`.

The extension does not bundle the compiler. It starts `skelc lsp`, so install skelc in the same environment where the VS Code extension host runs.

## Quick Setup

1. Install skelc v0.13.0 or newer and confirm that VS Code can find it:

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
- Live schema compatibility diagnostics against Git `HEAD` or an explicit baseline
- A CodeLens and command that open the complete JSON compatibility report
- Related diagnostic locations and quick fixes
- Formatting, hover details, and decorator completion filtered for the element being decorated
- Deprecated declarations and elements in completion, hover, and symbol views
- Hierarchical document symbols and workspace symbol search
- Go to Definition and Find All References across workspace `.skel` files
- Rename for top-level declarations and their references
- Best-effort navigation while the current document contains a syntax error

The extension is a thin client: parsing, formatting, diagnostics, completion, navigation, and rename are all provided by the compiler's language server rather than reimplemented in JavaScript.

## Configuration

| Setting | Default | Use |
| --- | --- | --- |
| `skelc.path` | `skelc` | Select the skelc executable. Changing it restarts the language server. |
| `skelc.trace.server` | `off` | Trace LSP traffic with `off`, `messages`, or `verbose`. |
| `skelc.schemaCompatibility.diagnostics` | `true` | Report `BREAKING` and `DANGEROUS` changes while editing. |
| `skelc.schemaCompatibility.includeCompatible` | `false` | Also report `COMPATIBLE` changes as hints. |
| `skelc.schemaCompatibility.codeLens` | `true` | Show the compatibility CodeLens above domain declarations. |
| `skelc.schemaCompatibility.baseline` | empty | Explicit baseline relative to the domain source directory; empty uses Git `HEAD`. |

The Command Palette provides:

- `Skel: Restart Language Server`
- `Skel: Show Language Server Output`
- `Skel: Check Schema Compatibility`

For startup problems, run `skelc version --output-format json` in the extension host environment first. Then inspect the language-server output and enable `skelc.trace.server` when protocol details are needed.

## Remote Workspaces

The extension runs on the workspace side. In Remote SSH, WSL, or a Dev Container, install skelc in that remote environment or configure a remote value for `skelc.path`.

Virtual and untrusted workspaces are not supported because the extension needs filesystem access and starts the configured executable. Untitled Skel documents are supported.

## Develop the Extension

The extension lives in [`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support/tree/main/editors/vscode). From the repository root:

```bash
npm ci
npm run check
```

Open the repository in VS Code and press F5 to launch the Extension Development Host. The VS Code client, language configuration, theme, and Marketplace package live in `editors/vscode`.

Continue to run `skelc check` in terminals and CI. Live editor diagnostics follow the same per-directory validation rules, while CI remains the reproducible check for the complete input set.

To display Skel source in a website or browser editor, see the [Syntax Highlighting Package](/docs/syntax-highlighting).
