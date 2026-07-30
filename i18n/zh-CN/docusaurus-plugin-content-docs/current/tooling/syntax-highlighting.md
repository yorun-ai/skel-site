---
slug: /syntax-highlighting
---

# 语法高亮包

[`@yorun-ai/skel-highlight`](https://www.npmjs.com/package/@yorun-ai/skel-highlight) 为文档站、代码查看器和浏览器编辑器提供 Skel 语法高亮。它包含规范的 Skel TextMate grammar，以及面向常用 JavaScript 高亮器的适配器。

基于 TextMate 的适配器与 [VS Code 扩展](/docs/editor)共享同一份 grammar，其它适配器则复用同一套语言词汇。

## 安装

把这个包和项目正在使用的高亮器一起安装。所有高亮器 peer dependency 都是可选的，不需要安装用不到的集成。

| 宿主 | 与高亮包一起安装 | 导入入口 |
| --- | --- | --- |
| Shiki | `shiki` | `@yorun-ai/skel-highlight/shiki` |
| PrismJS 或 Refractor | `prismjs` | `@yorun-ai/skel-highlight/prism` |
| Highlight.js 或 Lowlight | `highlight.js` | `@yorun-ai/skel-highlight/highlightjs` |
| Monaco Editor | `monaco-editor` | `@yorun-ai/skel-highlight/monaco` |
| Starry Night | `@wooorm/starry-night` | `@yorun-ai/skel-highlight/starry-night` |
| CodeMirror 6 | `@codemirror/language` 和 `@codemirror/view` | `@yorun-ai/skel-highlight/codemirror` |
| TextMate 兼容工具 | 不需要适配器 peer dependency | `@yorun-ai/skel-highlight/textmate` |

这个包能识别 Skel 声明、内置类型、`@deprecated` 等 decorator、注释和字符串。

## 使用 PrismJS 快速接入

安装语法高亮包和 PrismJS：

```bash
npm install prismjs @yorun-ai/skel-highlight
```

在应用启动时注册一次 Skel：

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

[包 README](https://github.com/yorun-ai/skel-editor-support/tree/main/packages/highlight) 提供了 Shiki、PrismJS、Highlight.js、Monaco Editor、Starry Night、CodeMirror 6 和 TextMate 的完整示例。

## 语法高亮与语言能力

这个包只提供词法高亮，不会解析或校验契约。接入 Monaco 或 CodeMirror 适配器也不会自动获得诊断和补全；这些能力需要由客户端连接 `skelc lsp`。

如果需要开箱即用的诊断、补全、格式化和导航，请使用 [VS Code 扩展](/docs/editor)。

## 开发语法高亮包

语法高亮包位于 [`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support/tree/main/packages/highlight)。在仓库根目录运行：

```bash
npm ci
npm run check
```

规范的 TextMate grammar 和前端适配器位于 `packages/highlight`。
