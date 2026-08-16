---
slug: /installation
---

# 安装 skelc

## 前提条件

skelc 目前需要 Go 1.26.6 及以上版本。生成 Go module 时，输出用的是 skelc 内置的默认 Vine 版本；当前默认版本是 `v0.13.1`。

## 安装

```bash
go install go.yorun.ai/skelc/cmd/skelc@latest
skelc version
```

确保 Go 的 bin 目录在 `PATH` 里。如果终端找不到命令，运行 `go env GOBIN` 和 `go env GOPATH` 确认安装位置。

## 固定版本

CI 和需要可重复生成的场景建议锁死版本：

```bash
go install go.yorun.ai/skelc/cmd/skelc@v0.10.3
```

项目升级 skelc 之后，记得重新生成契约并 review diff；不要让开发机和 CI 默默跑着不同版本。

## 查看版本信息

```bash
skelc version
skelc version --output-format json
```

JSON 输出适合给构建脚本读。生成 Go 代码时用 `--go-vine-version` 拉高目标 Vine 版本，但不能低于 skelc 内置的默认版本。

## 添加编辑器支持

使用 VS Code 编写 `.skel` 文件时，安装 [Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton)。扩展会使用 `PATH` 中的 skelc 可执行文件启动 `skelc lsp`，要求 skelc v0.10.3 或更高版本。

如果要在文档站、代码查看器或浏览器编辑器中展示 Skel，安装 [`@yorun-ai/skel-highlight`](https://www.npmjs.com/package/@yorun-ai/skel-highlight)，并按需搭配项目正在使用的高亮器。

接下来阅读 [VS Code 扩展](/docs/editor)或[语法高亮包](/docs/syntax-highlighting)指南。

下一步：[创建首个契约](/docs/getting-started)。
