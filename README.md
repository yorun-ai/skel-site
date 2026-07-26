# Skel Site

**English** | [简体中文](README.zh-CN.md)

This repository contains the public website and documentation for the Skel language and skelc toolchain, published at [skel.yorun.ai](https://skel.yorun.ai).

Vine framework documentation is maintained separately in [`vine-site`](https://github.com/yorun-ai/vine-site) and published at [vine.yorun.ai](https://vine.yorun.ai).

## Development

Prerequisites: Node.js 20 or later and pnpm.

```bash
pnpm install
pnpm dev:zh
```

Use `pnpm dev:en` for English. Validate both locales with:

```bash
pnpm typecheck
pnpm build
```

## Versioning

Documentation versions follow skelc releases:

```bash
pnpm docusaurus docs:version 0.10.0
```

Do not edit generated version snapshots manually.

## License

Skel Site is open source under the [Apache License 2.0](LICENSE).
