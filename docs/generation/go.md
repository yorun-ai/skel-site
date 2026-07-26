---
slug: /generation/go
---

# 生成 Go

## 已有 module

```bash
skelc gen go \
  --skel-in ./skel \
  --go-out ./skeled
```

该模式只生成源码，不创建 `go.mod`，适合输出目录已经属于当前 module 的情况。

## 独立 module

```bash
skelc gen go-module \
  --skel-in ./skel \
  --go-out ./skeled/golang \
  --go-module example.com/demo/user/skeled
```

同时需要公开 module 时增加 `--go-pub-out` 和 `--go-pub-module`。regular module 包含完整契约和服务端能力；pub module 只暴露公开 client/listener 与必要类型。

## 外部依赖

```bash
--skel-import demo.account=../account/pub/skel \
--go-import demo.account=example.com/demo/account/skeledpub
```

统一命名规则下可用 `--go-module-prefix` 推导路径。生成后运行 `gofmt`、`go test`，并审查 `go.mod` 与 API diff。完整参数见[CLI 参考](/docs/cli)。
