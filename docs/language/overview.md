---
slug: /language
---

# Skel Language Overview

A Skel domain describes a contract that remains true outside one implementation file. Top-level declarations fall into four groups:

| Group | Declarations | Purpose |
| --- | --- | --- |
| Data | `enum`, `data`, `config` | Values, messages, and configuration shapes |
| Identity and permission | `actor`, `resource` | Callers, authentication, and authorization |
| Interaction | `service`, `event` | Synchronous and asynchronous boundaries |
| Entry and execution | `web`, `task` | Web capabilities and task triggers |

## Suggested Modeling Order

1. Establish stable vocabulary with `data` and `enum`.
2. State who can call with `actor`.
3. Define `resource` when authorization is required.
4. Compose capabilities with `service`, `event`, `web`, and `task`.
5. Mark only genuinely cross-domain declarations as `pub`.

See the [syntax reference](/docs/syntax) for every rule and [contract design](/docs/contract-design) for public boundaries.
