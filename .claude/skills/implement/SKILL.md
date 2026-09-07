---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Write the test before the implementation, at pre-agreed seams. Tests live in `tests/`.

Run `pnpm run verificar` regularly. It covers typecheck and the full suite. Never use npm: the repository only accepts pnpm.

Once done, use /code-review to review the work.

One ticket, one verified commit on `master`. Conventional commits. Then add a `T<n>` line to `.context/hot-memory.md` and update the ticket stage in `.context/backlog.md`.
