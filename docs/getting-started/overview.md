---
slug: /overview
---

# Start with Skel

skelc enables a contract-first workflow: you describe domain types, callers, permissions, and capabilities in `.skel`, validate everything once, and generate the interfaces each language needs.

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

Route implementations, database models, business algorithms, and deployment configuration are application concerns. Don't force them into Skel just to make everything declarative.

## Next

[Install skelc](/docs/installation), then work through the [quick start](/docs/getting-started). If you're adding Skel to an existing project, jump straight to [inputs and layout](/docs/input-layout).
