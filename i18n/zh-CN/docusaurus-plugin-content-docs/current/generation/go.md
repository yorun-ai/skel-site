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

## 集合编码与校验

生成的 Go 代码使用指针表示 nullable 集合，生成的 module 需要 Go 1.27.0 及以上版本。在已有 module 中生成时，需要自行更新依赖。

| Skel 类型 | 生成的 Go 类型 |
| --- | --- |
| `list<T>` | `[]T` |
| `list<T>?` | `*[]T` |
| `map<K, V>` | `map[K]V` |
| `map<K, V>?` | `*map[K]V` |

nil 指针表示 `null`；非 nil 指针表示集合，即使它指向的 slice 或 map 为 nil。v0.15 编码契约会把 nil slice/map 编码为 JSON 和 CBOR 的空数组、空 map。非 nullable 集合因此不需要 nil 检查：输入 `null` 不会触发生成校验错误，再次编码时会输出空集合。

生成器或 runtime 变化时，应连同应用一起重新生成 package，并在使用到的地方同时测试 JSON 和 CBOR 链路。生成的 package 与加载它们的 runtime 应使用同一个 skelc 版本构建。

## 进程内 Rpc 值隔离

生成的 package 不需要为进程内隔离编写任何代码：Vine 会让进程内调用的参数和结果与调用方、Handler 相互独立，覆盖 Skel 契约能承载的生成标量、list、map、nullable 值和 bean。应用代码需要自己的生成 bean 副本时使用 [`vbean.DeepClone`](https://pkg.go.dev/go.yorun.ai/vine/util/vbean)。

这项保证只覆盖值隔离。JSON 或 CBOR 编解码、传输规范化、自定义 marshal/unmarshal 方法和 codec 错误都不在进程内契约范围内。导入的生成 package 行为一致，请一起重新生成，让它们的 schema 来自同一个编译器版本。

## 生成包所有权

生成的 Go package 完全由 skelc 管理。不要直接修改生成文件，也不要在同一个 package 中加入手写 `.go` 文件。skelc 和 Vine 的兼容保证只覆盖生成声明；一旦非托管文件添加了声明、方法或自定义 codec 行为，生成包的编译和运行都不再有保证。业务实现和 adapter 应放在独立 package 中。

## 弃用输出

`@deprecated` 会变成生成 Go 声明、method、常量和字段上的标准 `Deprecated:` 文档段落，支持 Go 的编辑器可以据此展示弃用符号。多行解释文本也会保持为合法的 Go 文档。

## 外部依赖

```bash
--skel-import demo.account=../account/pub/skel \
--go-import demo.account=example.com/demo/account/skeledpub
```

如果用的是统一的命名规则，用 `--go-module-prefix` 就能自动推导路径，无需逐个配置。生成完后运行 `gofmt` 和 `go test`，检查 `go.mod` 和 API diff。完整参数清单见 [CLI 参考](/docs/cli)。

后端 Go 输出要求 Vine v0.20.2 或更高版本，并默认使用 v0.20.2。在已有 module 中生成时，需要自行更新依赖。

## Web 生成

普通 Go 生成为每个 `web` 声明注册一个 Web spec。Web 能力不能标记 `pub`，因此 pub 契约 module 不包含 Web 产物。

服务端接口命名为 `<WebName>Server`，默认实现命名为 `Default<WebName>Server`。其他包的实现需要嵌入默认类型并覆盖所需路由。该默认类型只是空壳：在 Go 代码提供路由之前，它的 `Routes(*web.Router)` 会 panic。

声明的 `mount` 会以 `MountPath` 写入 `WebSpec` 和 runtime domain schema。使用挂载能力需要 Vine v0.19.0 或更高版本；当前所有后端 Go 输出的依赖版本为 v0.20.2。

## Portal API 客户端

```bash
skelc gen go-module --api \
  --skel-in ./skel \
  --go-out ./generated/orderapi \
  --go-module-prefix example.com/gen
```

领域为 `shop.order` 时，推导 module 为 `example.com/gen/shop/orderapi`，包名为 `orderapi`。`--go-module` 可覆盖 module 路径；`gen go --api` 写入已有模块。`--api` 与 `--pub` 互斥；默认 Go 生成用于后端实现，`--pub` 选择后端公共契约。

API 客户端依赖 `go.yorun.ai/vrpc` v0.12.0 或更高版本，可用 `--go-vrpc-version` 指定。基础类型来自 `go.yorun.ai/vrpc/skel`。跨领域类型依赖指向对应 `xxxapi` 包，不依赖 Vine。

调用 `NewOrderApiServiceClient(client)`，传入为你配置好的 `*vrpc.Client`（指向 Portal 地址）。构造函数返回 `OrderApiServiceClient` 接口，你可以在测试中提供自己的实现或 mock。每个生成方法接受 `context.Context`、声明的业务参数和任意可选 `vrpc.InvokeOption`，返回业务结果与 `error`；无结果的方法仅返回 `error`。

`--api` 客户端使用 vRPC，不依赖 Vine。

skelc 会为 `open service` 在 pub 包中同时生成 Client、Server/ERServer 及默认实现；regular 包使用类型别名复用服务端接口，避免重复注册。普通 `pub service` 的 pub 包仍只生成客户端。
