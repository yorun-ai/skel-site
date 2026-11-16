---
slug: /runtime-types
---

# Runtime Types

Generated Skel Go code uses `go.yorun.ai/skel/types`, imported as `skeltype`, for extended scalars other than UUID, which uses native `uuid.UUID`. Backend actor markers and contract metadata come from `go.yorun.ai/vine/core/skel`. Their transport shapes and comparison rules matter whenever an application stores a value or exchanges it with another language.

## Scalar Encoding

Skel's extended scalars follow one basic rule:

> CBOR is the binary transport form of JSON. Except for `Binary`, a Skel scalar should have the same data shape in JSON and CBOR whenever possible.

This gives Go, TypeScript, and other runtimes a consistent understanding of protocol semantics and makes debugging and replay easier.

### Decimal (High-Precision Decimal)

`Decimal` encodes as a string in both JSON and CBOR.

```json
"1.00"
```

The encoding preserves the decimal scale -- `1.00` is not normalized to `1`. This matters for money, ratios, display precision, and similar use cases. Decoding accepts exponent magnitudes up to 10000 after accounting for fractional digits; for example, `1e10000` is accepted and `1e10001` is rejected.

### Timestamp (Point in Time)

`Timestamp` encodes as an RFC3339Nano string in both JSON and CBOR and is always converted to UTC.

```json
"2026-05-04T05:14:15.123456789Z"
```

Use `LocalDateTime` rather than `Timestamp` when business data represents a local date and time without a time zone.

### Duration (Time Span)

`Duration` encodes in both JSON and CBOR as a string compatible with Go's `time.ParseDuration`.

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

They aren't converted to UTC and carry no time zone.

### UUID (Unique Identifier)

`uuid` generates native Go `uuid.UUID`. The shared `go.yorun.ai/skel/types/codec` JSON/CBOR codecs encode it as a standard UUID string. `skeltype.UUID` and `skeltype.NewUUID` are deprecated; use `uuid.Parse`, `uuid.New`, or other functions from Go's `uuid` package directly. Skel v0.35.0 provides the shared codec; Rpc traffic with native UUID values uses the paired Vine v0.33.0 or vRPC Go v0.17.0 release.

```json
"550e8400-e29b-41d4-a716-446655440000"
```

When `uuid` is a map key, generated Go uses `map[uuid.UUID]T`, generated TypeScript uses `Record<string, T>`, and the UUID string is the key in both JSON and CBOR.

### JSON (JSON Text)

`JSON` represents a JSON document as text. To keep the wire shape simple, it encodes as a string in both JSON and CBOR.

```json
"{\"name\":\"vine\",\"count\":2}"
```

### Binary (Binary Data)

`Binary` is the only scalar intentionally encoded differently in JSON and CBOR:

- JSON encodes it as a Base64 string.
- CBOR encodes it as raw bytes.

JSON has no native byte type, so Base64 is required. CBOR has a native byte type and carries the binary payload directly.

The TypeScript generator maps `Binary` to `Uint8Array`, and a generated service spec includes sparse `wire` schemas only when method arguments or results contain Binary; normal JSON methods get no extra metadata. [TypeScript output](/docs/generation/typescript) covers how applications inject the CBOR codec.

## Payload Codec

Use `go.yorun.ai/skel/types/codec` to encode Skel payloads outside vRPC as well:

```go
encoded, err := codec.MarshalCBOR(value)
// Handle err before decoding.
err = codec.UnmarshalCBOR(encoded, &result)
```

`MarshalJSON` and `UnmarshalJSON` provide the JSON equivalents.
`MustMarshalJSONString` returns JSON text directly and panics if encoding fails. These fixed rules
encode native UUIDs as text and nil collections as empty collections, reject
duplicate keys, and apply generated enum validation during CBOR decoding.
Transport envelopes and body limits remain the caller's responsibility.

## Collection Types

Go collection nullability and the encoding contract are described in
[Go Generation](/docs/generation/go#collection-encoding-and-validation).
The `binary` scalar keeps its byte encoding and is not a `list<T>`.

## Domain Descriptor Registration

Backend packages emit `descriptor.go`, constructing a `descriptor.Domain` from
`go.yorun.ai/skel/descriptor` and passing it to
`skel.RegisterDomainDescriptor`. These values contain runtime metadata and named
type references, without source positions.

Registration requires Vine v0.33.0 or later. A descriptor whose compiler
version is missing or below `skel.MinSkelcVersion()` fails during application
startup.
