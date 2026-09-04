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

## 集合可空性与校验

从 skelc v0.15.0 开始，生成的 Go 代码使用指针表示 nullable 集合，要求 Go 1.27.0 及以上版本和 Vine v0.14.0 或更高版本；生成 module 的默认 Vine 依赖为 v0.14.0。在已有 module 中生成时，需要自行更新依赖。

| Skel 类型 | 生成的 Go 类型 |
| --- | --- |
| `list<T>` | `[]T` |
| `list<T>?` | `*[]T` |
| `map<K, V>` | `map[K]V` |
| `map<K, V>?` | `*map[K]V` |

nil 指针表示 `null`；非 nil 指针表示集合，即使它指向的 slice 或 map 为 nil。v0.15 编码契约会把 nil slice/map 编码为 JSON 和 CBOR 的空数组、空 map。因此非 nullable 集合不再需要 nil 检查；输入 `null` 不会触发生成校验错误，再次编码时会输出空集合。

生成的 data（包括 actor 认证数据）不再提供 `Validate(path string) error`，Rpc method spec 的 `ValidateArguments` 和 `ValidateResult` 固定为 `nil`。移除的是集合 nil 校验，不是 Skel 源码检查或应用自身的业务校验。

从 skelc v0.14.x 升级时，需要重新生成 package，并将赋值、集合访问和 service 签名适配到新的指针类型。Clone 方法会复制指针及其可变内容，保留 nil 状态，不做传输规范化。TypeScript 集合类型保持不变。

与导入的 Go package 的维护者协调重新生成，建议先升级依赖方，再升级消费方。尤其应避免在使用新编码契约的类型中嵌套旧版 nullable slice/map 表示。删除对生成 `Validate` 方法的调用，保留业务校验，并测试消费方实际使用的 JSON 和 CBOR 链路。

Vine v0.14.0 对 skelc v0.14.x 生成的 schema 继续保留 nil 编码为 null 的行为。仅升级 Vine 不会迁移 Go 类型；新编码契约根据 schema 的 `CompilerVersion` 选择，而不是根据校验 hook 是否存在。

## 进程内 Rpc 值隔离

生成的非泛型 data 类型会提供 `Clone()`，泛型 data 类型则提供 `CloneBy(...)`，每个类型参数对应一个类型安全的 clone callback。生成的 Rpc method spec 会组合这些方法，形成类型安全的请求和结果 clone hook。Vine 用这些 hook 防止可变参数和结果泄漏到进程内 caller/handler 边界之外。

这项契约只保证值隔离。JSON 或 CBOR 编解码、传输规范化、自定义 marshal/unmarshal 方法和 codec 错误都不在进程内契约范围内，行为可能随生成的 spec 而异。软递归 data 也使用生成的 clone 方法。

导入的生成 data 必须提供 `Clone()` 或 `CloneBy(...)`。从 skelc v0.11.x 升级前，请先重新生成所有导入的 package。

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
