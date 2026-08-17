---
slug: /generation/go
---

# Go 生成

## 已有 module

```bash
skelc gen go \
  --skel-in ./skel \
  --go-out ./skeled
```

这个模式只生成源码文件。如果你已经有一个 `go.mod`，输出目录直接放进当前 module 就能用——不需要额外初始化。

## 独立 module

```bash
skelc gen go-module \
  --skel-in ./skel \
  --go-out ./skeled/golang \
  --go-module example.com/demo/user/skeled
```

如果还需要对外暴露 module，加上 `--go-pub-out` 和 `--go-pub-module` 就行。regular module 包含完整契约和服务端能力，pub module 则只暴露公开的 client/listener 和必要的类型。

## 进程内 Rpc 值隔离

生成的非泛型 data 类型会提供 `Clone()`，泛型 data 类型则提供 `CloneBy(...)`，每个类型参数对应一个类型安全的 clone callback。生成的 Rpc method spec 会组合这些方法，形成类型安全的请求和结果 clone hook。Vine 用这些 hook 防止可变参数和结果泄漏到进程内 caller/handler 边界之外。

这项契约只保证值隔离。JSON 或 CBOR 编解码、传输规范化、自定义 marshal/unmarshal 方法和 codec 错误都不在进程内契约范围内，行为可能随生成的 spec 而异。软递归 data 也使用生成的 clone 方法。

skelc v0.12.x 至 v0.14.x 支持与 v0.11.x 生成的 Go package 一起滚动升级。建议逐步重新生成所有导入的 package，并在升级到 v0.15.0 前完成迁移；从 v0.15.0 开始，导入的生成 data 必须提供 `Clone()` 或 `CloneBy(...)`。

## 生成包所有权

生成的 Go package 完全由 skelc 管理。不要直接修改生成文件，也不要在同一个 package 中加入手写 `.go` 文件。skelc 和 Vine 的兼容保证只覆盖生成声明；一旦非托管文件添加了声明、方法或自定义 codec 行为，生成包的编译和运行都不再有保证。业务实现和 adapter 应放在独立 package 中。

## 弃用输出

`@deprecated` 会变成生成 Go 声明、method、常量和字段上的标准 `Deprecated:` 文档段落，支持 Go 的编辑器可以据此展示弃用符号。生成的 domain schema 还会携带 `Deprecated` 和 `DeprecatedReason`，供 Vine 工具消费。多行解释文本也会保持为合法的 Go 文档。

## 外部依赖

```bash
--skel-import demo.account=../account/pub/skel \
--go-import demo.account=example.com/demo/account/skeledpub
```

如果用的是统一的命名规则，用 `--go-module-prefix` 就能自动推导路径，无需逐个配置。生成完后运行 `gofmt` 和 `go test`，检查 `go.mod` 和 API diff。完整参数清单见 [CLI 参考](/docs/cli)。
