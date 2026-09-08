---
name: typescript-quality
description: Reviews, creates, and modifies TypeScript code using strict quality rules for TypeScript, Zod, modular architecture, SOLID, Jasmine, duplication, and documentation. Use when reviewing, writing, refactoring, testing, documenting, or validating TypeScript modules, services, helpers, hooks, tools, harnesses, Zod schemas, or Jasmine tests.
---

# TypeScript Quality

## Mode
- Default: audit and recommend.
- Modify code, tooling, config, or dependencies only when explicitly requested.
- Run project tooling first; then review what tools cannot judge well.

## Workflow
1. Read repo instructions, `package.json`, `tsconfig*`, lint config, test config, and relevant docs.
2. Run existing checks when available: TypeScript, lint, tests, coverage, duplication, dependency checks.
3. Review architecture, behavior, types, Zod boundaries, SOLID, modularity, duplication, tests, and docs.
4. Classify findings: `blocker`, `warning`, `note`.
5. Return `PASS`, `PASS WITH WARNINGS`, or `FAIL`.
6. If fixes are requested, make the smallest coherent change and update tests + docs.

## Hard rules
- Prefer strict types. Avoid `any`; use `unknown` + narrowing/Zod at untrusted boundaries.
- Use Zod for external/untrusted data, not redundant internal validation.
- Keep modules cohesive, APIs narrow, dependencies directed, and side effects at clear boundaries.
- Treat circular dependencies as blockers unless explicitly justified in docs.
- Detect syntactic and semantic duplication; do not force abstractions that reduce clarity.
- Apply SOLID as design judgment, not ceremony.
- Jasmine tests must validate behavior, failures, and important edge cases; mock boundaries, not internals.
- Comments: max 2 lines per comment block. Explain intent, never narrate obvious code.
- Every maintained source file and every helper/common/hook/tool/harness/function must be covered by mirrored documentation in `docs/`.
- Long explanations belong in docs; short code comments may link to the matching docs page.
- Documentation teaches from zero: define terms before using them, explain why/how, and use small concrete examples.
- Generated/vendor code is excluded unless maintained locally.
- Legacy rule: do not worsen untouched debt; report it and improve touched code when reasonable.

## Documentation
Mirror source paths:

`src/a/b.ts` -> `docs/a/b.md`

A docs page must cover purpose, prerequisites, flow, public API, internal functions/helpers, examples, errors, and relationships.

## Detailed rules
Read [REFERENCE.md](REFERENCE.md) when reviewing or changing code. 
Read [EXAMPLES.md](EXAMPLES.md) for expected findings and documentation style.
