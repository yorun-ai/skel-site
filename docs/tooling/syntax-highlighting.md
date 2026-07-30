---
slug: /syntax-highlighting
---

# Syntax Highlighting Package

[`@yorun-ai/skel-highlight`](https://www.npmjs.com/package/@yorun-ai/skel-highlight) adds Skel syntax highlighting to documentation sites, code viewers, and browser editors. It provides the canonical Skel TextMate grammar and adapters for popular JavaScript highlighters.

The TextMate-based adapters share the same grammar as the [VS Code extension](/docs/editor); the other adapters reuse the same language vocabulary.

## Install

Install the package together with the highlighter your application already uses. All highlighter peer dependencies are optional, so you do not need to install integrations you will not use.

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

## Quick Start with PrismJS

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

## Highlighting and Language Intelligence

The package provides lexical highlighting only. It does not parse or validate contracts, and adding the Monaco or CodeMirror adapter does not automatically enable diagnostics or completion. Those features require a client connected to `skelc lsp`.

Use the [VS Code extension](/docs/editor) when you want a ready-made editing environment with diagnostics, completion, formatting, and navigation.

## Develop the Package

The package lives in [`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support/tree/main/packages/highlight). From the repository root:

```bash
npm ci
npm run check
```

The canonical TextMate grammar and frontend adapters live in `packages/highlight`.
