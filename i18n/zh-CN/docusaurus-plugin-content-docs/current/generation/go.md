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

## 弃用输出

`@deprecated` 会变成生成 Go 声明、method、常量和字段上的标准 `Deprecated:` 文档段落，支持 Go 的编辑器可以据此展示弃用符号。生成的 domain schema 还会携带 `Deprecated` 和 `DeprecatedReason`，供 Vine 工具消费。多行解释文本也会保持为合法的 Go 文档。

## 外部依赖

```bash
--skel-import demo.account=../account/pub/skel \
--go-import demo.account=example.com/demo/account/skeledpub
```

如果用的是统一的命名规则，用 `--go-module-prefix` 就能自动推导路径，无需逐个配置。生成完后运行 `gofmt` 和 `go test`，检查 `go.mod` 和 API diff。完整参数清单见 [CLI 参考](/docs/cli)。
