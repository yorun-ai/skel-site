---
slug: /installation
---

# 安装 skelc

## 前提条件

skelc v0.15.0 和生成的 Go module 需要 Go 1.27.0 及以上版本。生成的 Go module 要求 Vine `v0.14.0` 或更高版本，默认依赖为 `v0.14.0`。在已有 Go module 中生成时，需要自行更新依赖。

## 安装

```bash
go install go.yorun.ai/skelc/cmd/skelc@latest
skelc version
```

确保 Go 的 bin 目录在 `PATH` 里。如果终端找不到命令，运行 `go env GOBIN` 和 `go env GOPATH` 确认安装位置。

## 固定版本

CI 和需要可重复生成的场景建议锁死版本：

```bash
go install go.yorun.ai/skelc/cmd/skelc@v0.15.0
```

升级 skelc 之后，重新生成契约并 review diff。升级到 v0.15.0 时，请先阅读 [Go 集合迁移说明](/docs/generation/go#集合可空性与校验)，再重新生成。开发机和 CI 应使用相同的编译器版本。

## 查看版本信息

```bash
skelc version
```

JSON 输出适合给构建脚本读，其中会报告最低和默认 Vine 版本。生成 Go 代码时可以用 `--go-vine-version` 选择目标 Vine 版本，但不能低于 skelc 支持的最低版本。

## 添加编辑器支持

使用 VS Code 编写 `.skel` 文件时，安装 [Skeleton DSL Support](https://marketplace.visualstudio.com/items?itemName=yorun.skeleton)。扩展会使用 `PATH` 中的 skelc 可执行文件启动 `skelc lsp`，要求 skelc v0.14.0 或更高版本。

如果要在文档站、代码查看器或浏览器编辑器中展示 Skel，安装 [`@yorun-ai/skel-highlight`](https://www.npmjs.com/package/@yorun-ai/skel-highlight)，并按需搭配项目正在使用的高亮器。

接下来阅读 [VS Code 扩展](/docs/editor)或[语法高亮包](/docs/syntax-highlighting)指南。

下一步：[创建首个契约](/docs/getting-started)。
