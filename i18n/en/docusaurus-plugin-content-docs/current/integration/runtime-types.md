---
slug: /runtime-types
---

# Skel Runtime Types

Generated Skel Go code uses `core/skel` to represent extended scalars, actor markers, and contract metadata. This page explains what these types mean in transport and business code so that applications can store, compare, and exchange data correctly across languages.

## Scalar Encoding

Skel's extended scalars follow one basic rule:

> CBOR is the binary transport form of JSON. Except for `Binary`, a Skel scalar should have the same data shape in JSON and CBOR whenever possible.

This gives Go, TypeScript, and other runtimes a consistent understanding of protocol semantics and makes debugging and replay easier.

### Decimal (High-Precision Decimal)

`Decimal` is encoded as a string in both JSON and CBOR.

```json
"1.00"
```

Encoding preserves the decimal scale. In other words, `1.00` is not normalized to `1`. This matters for money, ratios, display precision, and similar use cases.

### Timestamp (Point in Time)

`Timestamp` is encoded as an RFC3339Nano string in both JSON and CBOR and is always converted to UTC.

```json
"2026-05-04T05:14:15.123456789Z"
```

Use `LocalDateTime`, not `Timestamp`, when business data represents a local date and time without a time zone.

### Duration (Time Span)

`Duration` is encoded in both JSON and CBOR as a string compatible with Go's `time.ParseDuration`.

```json
"1h30m0s"
```

### LocalDate / LocalTime / LocalDateTime (Local Date and Time)

These types use `cloud.google.com/go/civil` to represent local date and time concepts without a time zone.

```json
"2026-05-04"
"13:14:15.123456789"
"2026-05-04T13:14:15.123456789"
```

They are not converted to UTC and do not carry a time zone.

### UUID (Unique Identifier)

`UUID` is encoded as a standard UUID string in both JSON and CBOR.

```json
"550e8400-e29b-41d4-a716-446655440000"
```

### JSON (JSON Text)

`JSON` represents a JSON document as text. To keep the wire shape simple, it is encoded as a string in both JSON and CBOR.

```json
"{\"name\":\"vine\",\"count\":2}"
```

### Binary (Binary Data)

`Binary` is the only scalar intentionally encoded differently in JSON and CBOR:

- JSON encodes it as a Base64 string.
- CBOR encodes it as raw bytes.

JSON has no native byte type and therefore requires Base64. CBOR has a native byte type and carries the binary payload directly.

The TypeScript generator maps `Binary` to `Uint8Array`. A generated service spec includes sparse `wire` schemas only when method arguments or results actually contain Binary; normal JSON methods receive no extra metadata. Applications inject a CBOR codec into `@yorun-ai/vrpc`.

## Domain Schema Registry

Generated code calls the following function during package initialization:

```go
skel.RegisterDomainSchema(schema)
```

Read registered schemas with:

```go
skel.RegisteredDomainSchemas()
```

The result is sorted stably by `Domain`, which keeps application registration, test snapshots, and log comparisons deterministic.

`RegisterDomainSchema` checks the skelc version recorded in generated code. A schema produced by a version older than `skel.MinSkelcVersion()` fails during application startup.
