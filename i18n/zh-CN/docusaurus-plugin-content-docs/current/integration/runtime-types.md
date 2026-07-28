---
slug: /runtime-types
---

# 运行时类型

Skel 生成的 Go 代码使用 `core/skel` 表达扩展标量、Actor 标记和契约元数据。应用保存、比较或跨语言传递这些值时，需要遵守它们的传输形态与比较规则。

## 标量编码

Skel 标量扩展遵循一个基本规则：

> CBOR 是 JSON 的二进制传输形态。除 `Binary` 外，同一个 skel 标量在 JSON 和 CBOR 中尽量保持相同的数据形状。

这样可以让 Go、TypeScript 和其他 runtime 对协议语义有一致理解，也方便调试和回放。

### Decimal（高精度小数）

`Decimal` 在 JSON 和 CBOR 中都编码为字符串。

```json
"1.00"
```

编码时会保留 decimal scale。也就是说，`1.00` 不会被规范化为 `1`。这对金额、倍率、展示精度等场景很重要。

### Timestamp（时间戳）

`Timestamp` 在 JSON 和 CBOR 中都编码为 RFC3339Nano 字符串，并统一转为 UTC。

```json
"2026-05-04T05:14:15.123456789Z"
```

如果业务需要表达“不带时区的本地日期时间”，应使用 `LocalDateTime`，不要用 `Timestamp`。

### Duration（时长）

`Duration` 在 JSON 和 CBOR 中都编码为 Go `time.ParseDuration` 兼容字符串。

```json
"1h30m0s"
```

### LocalDate / LocalTime / LocalDateTime（本地时间）

这些类型使用 `cloud.google.com/go/civil` 表达不带时区的本地时间概念。

```json
"2026-05-04"
"13:14:15.123456789"
"2026-05-04T13:14:15.123456789"
```

它们不会自动转 UTC，也不携带 timezone。

### UUID（唯一标识）

`UUID` 在 JSON 和 CBOR 中都编码为标准 UUID 字符串。

```json
"550e8400-e29b-41d4-a716-446655440000"
```

### JSON（JSON 文本）

`JSON` 表示一段 JSON 文本。为了保持 wire shape 简单，它在 JSON 和 CBOR 中都编码为字符串。

```json
"{\"name\":\"vine\",\"count\":2}"
```

### Binary（二进制）

`Binary` 是唯一有意让 JSON 和 CBOR 形态不同的标量：

- JSON 编码为 base64 字符串
- CBOR 编码为原始 bytes

JSON 没有原生 bytes 类型，因此需要 base64；CBOR 有原生 bytes 类型，因此直接使用二进制 payload。

TypeScript generator 会把 `Binary` 映射为 `Uint8Array`。只有 method arguments 或 result 实际包含 Binary 时，生成的 service spec 才会附带稀疏 `wire` schema；普通 JSON method 不生成额外 metadata。应用需向 `@yorun-ai/vrpc` 注入 CBOR codec。

## Domain Schema 注册表

生成代码会在 init 阶段调用：

```go
skel.RegisterDomainSchema(schema)
```

注册后的 schema 可通过：

```go
skel.RegisteredDomainSchemas()
```

读取。返回结果按 `Domain` 稳定排序，便于 App 注册、测试快照和日志对比保持确定性。

`RegisterDomainSchema` 会检查生成代码里的 skelc 版本，低于 `skel.MinSkelcVersion()` 的 schema 会在启动期失败。
