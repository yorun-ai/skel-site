---
slug: /overview
---

# skelc Overview

skelc enables a contract-first workflow: describe domain types, callers, permissions, and capabilities in `.skel`, then validate them once and generate the interfaces each language needs.

## Compilation Pipeline

1. The loader discovers a single file or directory input.
2. The parser builds the domain semantic model.
3. The compiler validates naming, types, references, permissions, and public boundaries.
4. Generators emit Go, TypeScript, or reduced public Skel.
5. Formatter and symbol commands support daily maintenance.

## What Belongs in Skel

- Data shapes exchanged across processes or languages
- Rpc services, events, and task contracts
- Actors, authentication information, and permission resources
- Vine Web entry capabilities
- Public boundaries shared between domains

Route implementations, database models, business algorithms, and deployment configuration remain application concerns. Do not force them into Skel merely to make everything declarative.

## Next

[Install skelc](/docs/installation), then complete the [quick start](/docs/getting-started). For an existing project, go directly to [inputs and layout](/docs/input-layout).
