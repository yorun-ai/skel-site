---
slug: /editor
---

# 编辑器与语法高亮

Skel 提供两类互补的编辑器工具：编写契约时使用 VS Code 扩展；需要在应用中展示或编辑 Skel 源码时，使用 JavaScript 语法高亮包。

| 目标 | 选择 | 提供的能力 |
| --- | --- | --- |
| 在 VS Code 中编辑 `.skel` 文件 | [Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton) | 语法高亮，以及由 `skelc lsp` 提供的诊断、补全、格式化、导航等语言能力 |
| 在文档站、代码查看器或浏览器编辑器中展示 Skel | [`@yorun-ai/skel-highlight`](https://www.npmjs.com/package/@yorun-ai/skel-highlight) | 共享的 Skel 语法定义，以及面向常用 JavaScript 高亮器的适配器 |

VS Code 扩展和基于 TextMate 的适配器共享同一份规范 Skel 语法，其它适配器则复用同一套语言词汇。语义能力来自 `skelc lsp`；语法高亮包只负责词法高亮。

## VS Code 扩展

扩展标识为 `yorun.skeleton`。扩展不内置编译器，因此需要在 VS Code 扩展宿主所在的环境中安装 skelc。

### 快速配置

1. 安装 skelc v0.10.3 或更高版本，并确认 VS Code 所在环境能找到它：

   ```bash
   go install go.yorun.ai/skelc/cmd/skelc@latest
   skelc version --output-format json
   ```

2. 从 VS Code Marketplace 安装 [Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton)。
3. 打开包含 `.skel` 文件的目录，扩展会自动启动 `skelc lsp`。
4. 如果语言服务器没有启动，把 `skelc.path` 设为 skelc 可执行文件的绝对路径，再运行 `Skel: Restart Language Server`。

连接成功后，扩展提供：

- Skel 语法高亮和可选的 Skel Dark 主题
- 可恢复的语法诊断，以及按源目录隔离的语义诊断
- 诊断关联位置与快速修复
- 格式化、悬停信息，以及按被修饰对象过滤并去重的 decorator 补全
- 在补全、悬停和符号视图中展示弃用声明与元素
- 层级文档符号与工作区符号搜索
- 工作区内跨 `.skel` 文件的定义跳转和引用查找
- 顶层声明及其引用的重命名
- 当前文档存在语法错误时仍尽可能提供导航

扩展本身只是一个轻量客户端：解析、格式化、诊断、补全、导航和重命名全部由 skelc 的语言服务器提供，不会在 JavaScript 中重复实现。

### 配置

| 设置 | 默认值 | 用途 |
| --- | --- | --- |
| `skelc.path` | `skelc` | 指定 skelc 可执行文件；修改后会重启语言服务器。 |
| `skelc.trace.server` | `off` | 使用 `off`、`messages` 或 `verbose` 记录 LSP 通信。 |

命令面板中提供：

- `Skel: Restart Language Server`
- `Skel: Show Language Server Output`

遇到启动问题时，先在扩展宿主环境中运行 `skelc version --output-format json`。然后检查语言服务器输出；需要查看协议细节时，再启用 `skelc.trace.server`。

### 远程工作区

扩展运行在工作区一侧。使用 Remote SSH、WSL 或 Dev Container 时，需要在对应的远程环境中安装 skelc，或者为 `skelc.path` 配置远程值。

扩展需要访问文件系统并启动已配置的可执行文件，因此不支持虚拟工作区和不受信任的工作区。未保存的 Skel 文档仍然可以使用语言服务。

## JavaScript 语法高亮

网站或应用需要展示 Skel 源码时，使用 [`@yorun-ai/skel-highlight`](https://www.npmjs.com/package/@yorun-ai/skel-highlight)。只需安装这个包和项目正在使用的高亮器；所有高亮器 peer dependency 都是可选的。

### 选择集成方式

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

### 使用 PrismJS 快速接入

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

### 语法高亮与语言能力

这个包只提供词法高亮，不会解析或校验契约。接入 Monaco 或 CodeMirror 适配器也不会自动获得诊断和补全；这些能力需要由客户端连接 `skelc lsp`。

## 开发这些集成

扩展和语法高亮包都位于 [`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support)。在仓库根目录运行：

```bash
npm ci
npm run check
```

用 VS Code 打开仓库并按 F5，即可启动 Extension Development Host。规范的 TextMate 语法和前端适配器在 `packages/highlight` 目录；VS Code 客户端、语言配置、主题和 Marketplace 包在 `editors/vscode` 目录。

终端和 CI 中仍然应该运行 `skelc check`。编辑器实时诊断遵循相同的按目录校验规则，CI 则负责对完整输入集执行可复现检查。
