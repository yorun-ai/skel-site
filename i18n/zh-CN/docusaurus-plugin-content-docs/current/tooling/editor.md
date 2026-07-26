---
slug: /editor
---

# VS Code 支持

`vscode-skel` 扩展为 `.skel` 文件提供：

- TextMate 语法高亮
- `skelc lsp` 提供的多条实时语法与工作区语义诊断、关联位置、快速修复、格式化、关键字与类型补全和声明悬停信息
- 包含成员、方法、action、check 和 trigger 的层级文档符号与工作区符号搜索
- 本地声明和外部限定引用的跳转
- 声明与引用的查找
- 顶层声明及其引用的安全重命名
- 语法暂时不完整时保留 domain、import 和顶层声明的尽力索引
- Skel 专用深色主题

编辑器支持源码位于独立的 [`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support) 仓库。开发 VS Code 扩展时运行：

```bash
cd vscode-skel
npm ci
npm run check
```

扩展会从 PATH 启动 `skelc lsp`；非标准安装位置可以通过 `skelc.path` 设置。然后在 VS Code 中按 F5 启动 Extension Development Host。格式化只会修改语法有效的文档；重命名目前面向顶层声明。LSP 会合并同一 domain 的内存文档，并复用编译器规则实时执行命名、类型和跨 domain 校验；CI 和完整输入集校验仍应运行 `skelc check`。
