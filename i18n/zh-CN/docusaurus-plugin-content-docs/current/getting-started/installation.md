---
slug: /installation
---

# 安装 skelc

## 前提条件

skelc 当前要求 Go 1.26 或更高版本。生成 Go module 时，输出使用 skelc 内置的默认 Vine 版本；当前默认版本为 `v0.10.0`。

## 安装

```bash
go install go.yorun.ai/skelc/cmd/skelc@latest
skelc version
```

确认 Go 的 bin 目录位于 `PATH`。如果终端找不到命令，可用 `go env GOBIN` 和 `go env GOPATH` 确认安装位置。

## 固定版本

CI 和可重复生成环境应固定版本：

```bash
go install go.yorun.ai/skelc/cmd/skelc@v0.10.0
```

项目升级 skelc 后，应重新生成契约并审查 diff；不要让开发机和 CI 静默使用不同版本。

## 查看版本信息

```bash
skelc version
skelc version --output-format json
```

JSON 输出适合构建脚本读取。生成 Go 代码时可用 `--go-vine-version` 提高目标 Vine 版本，但不能低于 skelc 内置的默认版本。

下一步：[创建首个契约](/docs/getting-started)。
