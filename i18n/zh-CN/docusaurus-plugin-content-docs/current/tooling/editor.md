---
slug: /editor
---

# 编辑器支持

## Visual Studio Code

从 VS Code Marketplace 安装 [Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton)。扩展标识为 `yorun.skeleton`。

扩展提供：

- Skel 语法高亮和可选的 Skel Dark 主题
- 可恢复的语法诊断与工作区语义诊断
- 诊断关联位置与快速修复
- 格式化、悬停信息，以及按被修饰对象过滤并去重的 decorator 补全
- 在补全、悬停和符号视图中展示弃用声明与元素
- 层级文档符号与工作区符号搜索
- 跨工作区 `.skel` 文件的定义跳转和引用查找
- 顶层声明及其引用的重命名
- 当前文档存在语法错误时的尽力导航

打开 `.skel` 文件前，先装好 `skelc`：

```bash
go install go.yorun.ai/skelc/cmd/skelc@latest
skelc version --output-format json
```

扩展要求 skelc v0.10.3 或更高版本，并从 `PATH` 启动 `skelc lsp`。扩展本身只是一个轻量客户端：解析、格式化、诊断、补全、导航和重命名全部由 skelc 的语言服务器提供，不会在 JavaScript 中重复实现。

## 配置

| 设置 | 默认值 | 用途 |
| --- | --- | --- |
| `skelc.path` | `skelc` | 指定 skelc 可执行文件；修改后会重启语言服务器。 |
| `skelc.trace.server` | `off` | 使用 `off`、`messages` 或 `verbose` 记录 LSP 通信。 |

命令面板中提供两个命令：

- `Skel: Restart Language Server`
- `Skel: Show Language Server Output`

语言服务器启动失败时，先在 VS Code 扩展宿主所在的环境中运行 `skelc version --output-format json`。如果该环境的 `PATH` 找不到 skelc，把 `skelc.path` 设为绝对路径，然后重启语言服务器，再去输出频道查看。

## 远程工作区

扩展运行在工作区一侧。使用 Remote SSH、WSL 或 Dev Container 时，需要在对应的远程环境中安装 skelc，或者为 `skelc.path` 配置远程值。

扩展需要访问文件系统并启动已配置的可执行文件，因此不支持虚拟工作区和不受信任的工作区。未保存的 Skel 文档仍然能使用语言服务。

## JavaScript 语法高亮

[`@yorun-ai/skel-highlight`](https://github.com/yorun-ai/skel-editor-support/tree/main/packages/highlight) 是 Skel 的 JavaScript 语法高亮包。它提供共享的 Skel 语法定义，以及面向文档站、代码查看器和浏览器编辑器的适配器。

安装时，只需要同时加上项目正在使用的高亮器。各个高亮器都是可选的 peer dependency，按需安装即可。以 PrismJS 为例：

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

根据宿主选择对应的导入入口：

| 宿主 | 与高亮包一起安装 | 导入入口 |
| --- | --- | --- |
| Shiki | `shiki` | `@yorun-ai/skel-highlight/shiki` |
| PrismJS 或 Refractor | `prismjs` | `@yorun-ai/skel-highlight/prism` |
| Highlight.js 或 Lowlight | `highlight.js` | `@yorun-ai/skel-highlight/highlightjs` |
| Monaco Editor | `monaco-editor` | `@yorun-ai/skel-highlight/monaco` |
| Starry Night | `@wooorm/starry-night` | `@yorun-ai/skel-highlight/starry-night` |
| CodeMirror 6 | `@codemirror/language` 和 `@codemirror/view` | `@yorun-ai/skel-highlight/codemirror` |
| TextMate 兼容工具 | 不需要适配器 peer dependency | `@yorun-ai/skel-highlight/textmate` |

这个包能识别 Skel 声明、内置类型、`@deprecated` 等 decorator、注释和字符串，但只提供词法高亮。语义诊断以及格式化、补全、导航和重命名等语言能力需要接入 `skelc lsp`。

[包 README](https://github.com/yorun-ai/skel-editor-support/tree/main/packages/highlight) 提供了所有适配器的注册示例。

## 开发扩展

源码位于 [`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support)。在仓库根目录运行：

```bash
npm ci
npm run check
```

用 VS Code 打开仓库并按 F5，即可启动 Extension Development Host。规范的 TextMate 语法和前端适配器在 `packages/highlight` 目录；VS Code 客户端、语言配置、主题和 Marketplace 包在 `editors/vscode` 目录。

终端和 CI 中仍然应该运行 `skelc check`。编辑器实时诊断遵循相同的按目录校验规则，CI 则负责对完整输入集执行可复现检查。
