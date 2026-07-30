---
slug: /editor
---

# VS Code 扩展

[Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton) 为 VS Code 提供 Skel 语法高亮和语言能力。扩展标识为 `yorun.skeleton`。

扩展不内置编译器，而是启动 `skelc lsp`，因此需要在 VS Code 扩展宿主所在的环境中安装 skelc。

## 快速配置

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

## 配置

| 设置 | 默认值 | 用途 |
| --- | --- | --- |
| `skelc.path` | `skelc` | 指定 skelc 可执行文件；修改后会重启语言服务器。 |
| `skelc.trace.server` | `off` | 使用 `off`、`messages` 或 `verbose` 记录 LSP 通信。 |

命令面板中提供：

- `Skel: Restart Language Server`
- `Skel: Show Language Server Output`

遇到启动问题时，先在扩展宿主环境中运行 `skelc version --output-format json`。然后检查语言服务器输出；需要查看协议细节时，再启用 `skelc.trace.server`。

## 远程工作区

扩展运行在工作区一侧。使用 Remote SSH、WSL 或 Dev Container 时，需要在对应的远程环境中安装 skelc，或者为 `skelc.path` 配置远程值。

扩展需要访问文件系统并启动已配置的可执行文件，因此不支持虚拟工作区和不受信任的工作区。未保存的 Skel 文档仍然可以使用语言服务。

## 开发扩展

扩展位于 [`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support/tree/main/editors/vscode)。在仓库根目录运行：

```bash
npm ci
npm run check
```

用 VS Code 打开仓库并按 F5，即可启动 Extension Development Host。VS Code 客户端、语言配置、主题和 Marketplace 包位于 `editors/vscode`。

终端和 CI 中仍然应该运行 `skelc check`。编辑器实时诊断遵循相同的按目录校验规则，CI 则负责对完整输入集执行可复现检查。

如果要在网站或浏览器编辑器中展示 Skel 源码，请阅读[语法高亮包](/docs/syntax-highlighting)。
