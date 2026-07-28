---
slug: /input-layout
---

# Project Layout

## Single-File Mode

Experiments and small contracts can use one `.skel` file directly:

```bash
skelc check --skel-in ./user.skel
```

## Directory Mode

Use a directory for a production domain:

```text
user/
├── skel/
│   ├── domain.skel
│   ├── model.skel
│   └── service.skel
├── skeled/
└── pub/
```

`domain.skel` contains only the domain declaration and optional description. Other files declare the same domain and split contracts by responsibility. skelc loads files in filename order and ignores hidden files, subdirectories, and non-Skel files.

## External Domains

Declare the logical dependency in Skel:

```skel
import demo.user as user
```

Provide the physical mapping during generation:

```bash
--skel-import demo.user=../user/pub/skel
```

The logical domain name remains stable while build environments map paths and language package names. Go and TypeScript generation additionally use `--go-import` and `--ts-import`.

## Output Ownership

Generators manage their own output through `.skelc-manifest.json`, so generated and handwritten files can share a directory. Untracked files are not deleted, but a handwritten file must not use the same path as a generated file because the next run will overwrite it.

Continue with the [validation workflow](/docs/workflow) and [code generation](/docs/generation).
