# CI maintenance

GitHub CI runs on pull requests only. Main and tag pushes do not repeat CI.
Cloudflare Workers Builds continues to handle production builds and deployment.

The required `CI / Required Checks` gate always runs. Classification failures,
missing outputs, failed or cancelled builds, and unexpected skips fail the gate.
PR updates cancel older runs.

Only root README, AGENTS.md, CONTRIBUTING, CHANGELOG.md, LICENSE, issue/PR
templates and this maintenance guide skip site checks. All other changes select
site validation, including workflow changes and unknown files. Markdown in docs,
translations, version snapshots and source directories remains a build input.
Renames include both old and new paths.

Selected changes run typecheck, existing application tests (where provided), and
the production site build. CI policy tests always run, including maintenance-only
PRs. This workflow does not add an application test suite to documentation sites.

Validate workflow changes with `bash .github/scripts/ci_test.sh`,
`shellcheck .github/scripts/*.sh`, actionlint and `git diff --check`.
