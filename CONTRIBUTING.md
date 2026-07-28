# Contributing to Skel Site

Thank you for helping improve the Skel documentation. This repository contains
the public website for the Skel language and skelc toolchain.

## Before You Start

- Read [AGENTS.md](AGENTS.md) for the repository's documentation, ownership,
  versioning, and validation rules.
- Keep each pull request focused on one coherent documentation or site change.
- For substantial information-architecture or visual-design changes, open an
  issue or discussion before investing in the implementation.
- Do not include internal tools, private projects, credentials, deployment
  details, or other non-public information.

## Repository Scope

This repository owns the Skel language guide and reference, skelc installation
and CLI usage, diagnostics, code generation, LSP and editor integration, and
the Skel product site. Vine framework documentation belongs in
[`yorun-ai/vine-site`](https://github.com/yorun-ai/vine-site); link to
`https://vine.yorun.ai` instead of duplicating it here.

Language, compiler, formatter, generator, and LSP implementation changes belong
in [`yorun-ai/skelc`](https://github.com/yorun-ai/skelc). Editor extension
changes belong in
[`yorun-ai/skel-editor-support`](https://github.com/yorun-ai/skel-editor-support).
Documentation must describe behavior that exists in a released version or the
current source; do not present planned syntax or commands as available.

## Prerequisites

- Node.js 20 or later
- pnpm 11.17.0

Install dependencies and start the bilingual hot-reload development server:

```bash
pnpm install
pnpm dev
```

This command serves both locales from one local address, so edits refresh
automatically and locale switching remains available. To use fewer resources
while editing one locale, run `pnpm dev:en` or `pnpm dev:zh`; those commands
intentionally compile only one locale, and their language switcher cannot
navigate to the other locale.

## Documentation Layout

- English source documents: `docs`
- Simplified Chinese translations:
  `i18n/zh-CN/docusaurus-plugin-content-docs/current`
- Site and navigation configuration: `docusaurus.config.ts` and `sidebars.ts`
- Shared site components and styles: `src`

Update the English source and its Simplified Chinese translation in the same pull request.
Keep filenames, document IDs, headings, examples, diagrams, and internal links
aligned between locales.

Use `/docs/...` for links within this site. Use absolute
`https://vine.yorun.ai/docs/...` links for Vine content. Check that links and
navigation work in both locales.

## Writing and Site Changes

- Keep Skel examples parseable and commands accurate for the documented skelc
  version.
- Prefer complete, minimal examples over isolated syntax fragments.
- State version requirements when behavior depends on particular skelc, Vine,
  or editor-support releases.
- Preserve the existing visual language and shared component patterns.
- Keep diagrams readable in both light and dark themes.
- Do not commit `node_modules`, `.docusaurus`, `build`, editor state, generated
  compiler output, or local environment files.

For language, CLI, formatter, diagnostic, or generated-code documentation,
validate representative examples against `skelc` when practical.

## Documentation Versions

Before 1.0, edit only the current `next` documentation. Version snapshots
begin with `v1.0.0` and are generated during a release with:

```bash
pnpm docusaurus docs:version VERSION
```

Do not manually edit generated version snapshots. Creating or updating a
snapshot should be an explicit release task.

## Validation

Before submitting a pull request, run:

```bash
pnpm install --frozen-lockfile
pnpm audit:security
pnpm typecheck
pnpm build
git diff --check
```

`pnpm build` builds both the English and Simplified Chinese sites. Review the rendered
pages when changing navigation, components, styles, Markdown structure, or
Mermaid diagrams.

## Pull Request Checklist

- The change stays within the public Skel and skelc documentation scope.
- Chinese and English documents are synchronized.
- Syntax, commands, diagnostics, links, and version requirements are accurate.
- Both locales build successfully.
- Compatibility or regeneration implications are explained.
- No credentials, private information, local paths, or generated build output
  are included.

## License

Unless explicitly stated otherwise, any contribution intentionally submitted
for inclusion in Skel Site is licensed under the terms and conditions of the
[Apache License 2.0](LICENSE), in accordance with Section 5 of the license.

By submitting a contribution, you represent that you have the right to submit
it under these terms.
