---
slug: /input-layout
---

# Project Layout

## Single-File Mode

Experiments and small contracts can live in one `.skel` file:

```bash
skelc check --skel-in ./user.skel
```

## Directory Mode

Reach for a directory when you're building a production domain:

```text
user/
├── skel/
│   ├── domain.skel
│   ├── model.skel
│   └── service.skel
├── skeled/
└── pub/
```

`domain.skel` holds the domain declaration and an optional description. Other files declare the same domain and split contracts by responsibility. skelc loads files in filename order, skipping hidden files, subdirectories, and anything that isn't a `.skel` file.

## External Domains

Declare the logical dependency in Skel:

```skel
import demo.user as user
```

Then supply the physical mapping during generation:

```bash
--skel-import demo.user=../user/pub/skel
```

The logical domain name stays stable while build environments map paths and language package names. Go and TypeScript generation layers on `--go-import` and `--ts-import` respectively.

## Output Ownership

Generators track their own output through `.skelc-manifest.json`, so generated and handwritten files can share a directory. Untracked files are left alone, but if a handwritten file lands on a path that a generator owns, the next run will overwrite it.

Continue with the [validation workflow](/docs/workflow) and [code generation](/docs/generation).
