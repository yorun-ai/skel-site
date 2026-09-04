# Security Policy

Please report suspected vulnerabilities privately through
[GitHub security advisories](https://github.com/yorun-ai/skel-site/security/advisories/new).
Do not open a public issue for an undisclosed vulnerability.

Security fixes are applied to the current `main` branch. This documentation
site does not maintain separately supported release branches.

Dependency vulnerability monitoring and security update PRs are handled by
Dependabot. Keep the dependency graph, Dependabot alerts, and security updates
enabled in GitHub repository settings. Review security update PRs before
merging; CI validates types and builds both locales without running an audit.

The repository carries narrow upstream fix backports for
`GHSA-5c6j-r48x-rmvq` and `GHSA-qj8w-gfj5-8c6v` on
`serialize-javascript@6.0.2`. Docusaurus currently requires the 6.x behavior,
while forcing 7.x breaks Mermaid static rendering. Version-based vulnerability
alerts may not recognize these backports. Review such alerts against the
committed patches rather than removing the patches or forcing a major upgrade.
