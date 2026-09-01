---
slug: /runtime-types
---

# 运行时类型

Skel 生成的 Go 代码用 `core/skel` 来表达扩展标量、Actor 标记和契约元数据。当你在应用里保存、比较或跨语言传递这些值时，需要了解它们的传输形态和比较规则。

## 标量编码

Skel 标量扩展遵循一个基本原则：

> CBOR 是 JSON 的二进制传输形态。除了 `Binary` 以外，同一个 skel 标量在 JSON 和 CBOR 中会尽量保持相同的数据形状。

这样一来，Go、TypeScript 和其他 runtime 对协议语义的理解就是一致的，调试和回放也更简单。

### Decimal（高精度小数）

`Decimal` 在 JSON 和 CBOR 中都编码为字符串。

```json
"1.00"
```

编码时保留 decimal scale，`1.00` 不会被规范化为 `1`。这对金额、倍率、展示精度等场景很重要。

### Timestamp（时间戳）

`Timestamp` 在 JSON 和 CBOR 中都编码为 RFC3339Nano 字符串，并统一转为 UTC。

```json
"2026-05-04T05:14:15.123456789Z"
```

如果需要表达“不带时区的本地日期时间”，应该用 `LocalDateTime` 而不是 `Timestamp`。

### Duration（时长）

`Duration` 在 JSON 和 CBOR 中都编码为 Go `time.ParseDuration` 兼容字符串。

```json
"1h30m0s"
```

### LocalDate / LocalTime / LocalDateTime（本地时间）

这些类型使用 `cloud.google.com/go/civil` 来表达不带时区的本地时间概念。

```json
"2026-05-04"
"13:14:15.123456789"
"2026-05-04T13:14:15.123456789"
```

它们不会自动转 UTC，也不携带 timezone 信息。

### UUID（唯一标识）

`UUID` 在 JSON 和 CBOR 中都编码为标准 UUID 字符串。

```json
"550e8400-e29b-41d4-a716-446655440000"
```

`uuid` 作为 map key 时，Go 生成类型为 `map[skel.UUID]T`，TypeScript 生成类型为 `Record<string, T>`，JSON 和 CBOR 都使用 UUID 字符串作为 key。

### JSON（JSON 文本）

`JSON` 表示一段 JSON 文本。为了保持 wire shape 简洁，它在 JSON 和 CBOR 中都编码为字符串。

```json
"{\"name\":\"vine\",\"count\":2}"
```

### Binary（二进制）

`Binary` 是唯一一个有意让 JSON 和 CBOR 形态不同的标量：

- JSON 编码为 base64 字符串
- CBOR 编码为原始 bytes

JSON 没有原生 bytes 类型，只能用 base64；CBOR 有原生 bytes 类型，直接携带二进制 payload。

TypeScript generator 会把 `Binary` 映射为 `Uint8Array`。只有 method arguments 或 result 实际包含 Binary 时，生成的 service spec 才会附带稀疏的 `wire` schema；普通 JSON method 不会生成额外 metadata。应用需要向 `@yorun-ai/vrpc` 注入 CBOR codec。

## Domain Schema 注册表

生成代码会在 init 阶段调用：

```go
skel.RegisterDomainSchema(schema)
```

注册后的 schema 可通过：

```go
skel.RegisteredDomainSchemas()
```

来读取。返回结果按 `Domain` 稳定排序，这样 App 注册、测试快照和日志对比都能保持确定性。

`RegisterDomainSchema` 会检查生成代码里的 skelc 版本，低于 `skel.MinSkelcVersion()` 的 schema 会在启动时报错退出。
