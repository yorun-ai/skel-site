# Security Policy

Please report suspected vulnerabilities privately through
[GitHub security advisories](https://github.com/yorun-ai/skel-site/security/advisories/new).
Do not open a public issue for an undisclosed vulnerability.

Security fixes are applied to the current `main` branch. This documentation
site does not maintain separately supported release branches.

The repository carries narrow upstream fix backports for
`GHSA-5c6j-r48x-rmvq` and `GHSA-qj8w-gfj5-8c6v` on
`serialize-javascript@6.0.2`. Docusaurus currently requires the 6.x behavior,
while forcing 7.x breaks Mermaid static rendering. The audit command ignores
only the high-severity advisory whose version check cannot detect the backport;
it continues to fail on any other high- or critical-severity production
dependency finding.
