---
slug: /editor
---

# VS Code Support

The `vscode-skel` extension provides:

- TextMate syntax highlighting
- Multiple live syntax and workspace semantic diagnostics, related locations, quick fixes, formatting, keyword and type completion, and declaration hover details from `skelc lsp`
- Hierarchical document symbols for members, methods, actions, checks, and triggers, plus workspace symbol search
- Go to Definition for local declarations and qualified references
- Find All References for declarations and uses
- Safe rename for top-level declarations and their references
- Best-effort domain, import, and top-level declaration indexing while syntax is temporarily incomplete
- A Skel-focused dark theme

Editor support source lives in the independent [`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support) repository. For VS Code extension development:

```bash
cd vscode-skel
npm ci
npm run check
```

The extension starts `skelc lsp` from PATH; use the `skelc.path` setting for a non-standard installation. Press F5 in VS Code to launch an Extension Development Host. Formatting changes only syntactically valid documents, and rename currently targets top-level declarations. The language server merges in-memory files in each domain and reuses compiler rules for live naming, type, and cross-domain validation; continue to run `skelc check` in CI and for complete input-set validation.
