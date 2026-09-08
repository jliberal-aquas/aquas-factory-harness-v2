# Reference Manual

This file contains the detailed review rules for `typescript-quality`.
Use it as the source of truth when a short rule in `SKILL.md` needs interpretation.

## 1. Review order

Always review in this order:

1. Repository rules and local conventions.
2. Existing deterministic tooling.
3. Type correctness.
4. Runtime boundaries and Zod.
5. Architecture and module boundaries.
6. Functions and side effects.
7. Duplication and abstraction quality.
8. Jasmine tests.
9. Documentation coverage and teaching quality.
10. Final severity and verdict.

Do not replace project tooling with invented rules. If a tool is missing, recommend it. Install or configure it only when explicitly requested.

## 2. Severity

### blocker
Use when the issue can make the system incorrect, unsafe, misleading, or structurally unstable.

Typical cases:
- Type errors or failing required tests.
- Invalid handling of untrusted input.
- Missing required validation at an external boundary.
- Circular dependency without an explicit, justified exception.
- Severe behavior duplication that can drift independently.
- Public behavior changed without matching tests or docs.
- A required source file or function has no documentation coverage.

### warning
Use when the code works but creates meaningful maintainability or design risk.

Typical cases:
- Mixed responsibilities.
- High coupling.
- Weak names that hide responsibility.
- Poor test isolation.
- Important edge cases not tested.
- Premature abstraction.
- Repeated code that should probably share one implementation.
- Documentation that exists but is incomplete or too technical.

### note
Use for optional clarity improvements that do not create meaningful risk.

## 3. TypeScript

### 3.1 Types are contracts
A type describes what values a piece of code is allowed to receive or return.
Do not use types merely to silence the compiler.

Prefer:
- Specific object shapes.
- Discriminated unions for states.
- `unknown` for data not yet trusted.
- Narrowing before use.
- `readonly` where mutation is not part of the contract.

Avoid:
- Broad `any`.
- Type assertions used as escape hatches.
- Boolean flags that hide multiple domain states when a union would be clearer.
- Duplicated type definitions that can drift.

### 3.2 `any`
`any` disables useful TypeScript checks.

Policy:
- Treat new `any` as a warning by default.
- Escalate when it hides an unsafe boundary or real type error.
- Allow it only for a documented legacy or third-party constraint.
- Prefer `unknown`, then prove the value's shape.

### 3.3 Type assertions
`value as SomeType` tells TypeScript to trust the programmer.

Allow it only when:
- Runtime facts make the type safe.
- The compiler cannot express that fact cleanly.
- The assertion does not hide invalid data.

Do not use `as` just to make an error disappear.

### 3.4 Imports and exports
Prefer explicit exports.
Keep internal implementation private.
Avoid global barrel files that make dependencies unclear or create cycles.
A local `index.ts` is acceptable when it represents a real module boundary with a deliberate public API.

## 4. Zod

### 4.1 What Zod is for
Zod checks data while the program is running.
TypeScript alone cannot prove that data from outside the program is valid.

Use Zod at untrusted boundaries such as:
- HTTP requests and external API responses.
- Environment variables.
- Files.
- Storage.
- Queues and events.
- User input.
- Unknown JSON.

Do not validate every internal object again when trusted TypeScript code already produced it.

### 4.2 Boundary flow
Preferred mental model:

`unknown -> Zod validation -> trusted typed value -> domain logic`

Keep parsing close to the boundary.

### 4.3 `parse` and `safeParse`
Use `safeParse` when invalid input is an expected branch that the program should handle.
Use `parse` when invalid input is exceptional and throwing is the intended contract.

Do not choose one mechanically.

### 4.4 Schema and type ownership
When a Zod schema is the source of truth, prefer `z.infer<typeof Schema>`.
Do not maintain a matching interface manually unless the domain intentionally needs a separate type.

## 5. Modules and architecture

### 5.1 Cohesion
A cohesive module contains things that belong together for one reason.
If a file changes for unrelated reasons, it probably has mixed responsibilities.

### 5.2 Coupling
Coupling means how strongly one module depends on another.
Prefer narrow, intentional dependencies.

Review:
- Import direction.
- Hidden shared state.
- Cross-module reach.
- Public API size.
- Whether internals leak through exports.

### 5.3 `utils`, `common`, `helpers`
These names are allowed only when the responsibility is still clear.
A dumping-ground module is a warning.

Prefer names that state purpose:
- `parse-user-id.ts`
- `retry-policy.ts`
- `date-range.ts`

instead of:
- `utils.ts`
- `helpers.ts`

when the latter hides unrelated behavior.

### 5.4 Circular dependencies
Treat circular dependencies as blockers unless the repository explicitly documents and justifies the exception.
Prefer changing dependency direction, extracting a smaller contract, or moving shared behavior to the correct lower-level module.

### 5.5 Public module APIs
A module should expose only what callers need.
Keep implementation details private.

## 6. Functions

A function should have one understandable job.
Do not use a fixed line-count limit as a quality rule.

Review:
- Number of responsibilities.
- Nesting.
- Branching.
- Hidden mutation.
- Side effects.
- Number and meaning of parameters.
- Whether the name describes the outcome.

Long code is a signal, not automatic proof of bad design.

### 6.1 Pure logic and side effects
Pure logic returns results from inputs without changing outside state.
Side effects include network calls, filesystem work, logging, timers, database writes, and global mutation.

Prefer separating pure decisions from side effects when doing so improves clarity and testing.
Do not add layers only to appear architectural.

## 7. SOLID

Use SOLID as a diagnostic lens, not a ceremony checklist.

### Single Responsibility
A unit should have one coherent reason to change.

### Open/Closed
Prefer extension points only when real variation exists.
Do not build plugin systems for hypothetical futures.

### Liskov Substitution
A replacement implementation must preserve the expectations of the contract.

### Interface Segregation
Consumers should depend only on the capabilities they need.

### Dependency Inversion
High-level policy should not be trapped behind low-level implementation details.
Inject dependencies only when substitution, isolation, or decoupling has real value.

A SOLID finding should explain the concrete harm: coupling, fragility, mixed responsibility, testing pain, or unclear ownership.

## 8. Duplication and abstraction

### 8.1 Syntactic duplication
Repeated lines or blocks are easy to detect with tools.
Run the repository's detector first when available.

### 8.2 Semantic duplication
Two implementations may use different lines but perform the same business behavior.
This requires review beyond a linter.

Flag semantic duplication when:
- The same rule is implemented independently.
- Two code paths must change together.
- Drift could produce conflicting behavior.

### 8.3 Do not worship DRY
Small repetition can be better than the wrong abstraction.
Do not merge code only because it looks similar.
Abstract when the shared concept is real and stable.

A one-use abstraction without a clear architectural reason is usually a warning.

## 9. Jasmine

Tests should describe behavior, not mirror implementation.

### 9.1 Structure
Use `describe` to group behavior and `it` for a specific observable expectation.
Names should explain what the system does.

Arrange–Act–Assert is preferred when it makes a test easier to scan:
- Arrange: prepare inputs/dependencies.
- Act: run the behavior.
- Assert: verify the result.

Do not force comments naming these sections when the test is already obvious.

### 9.2 Required behavior coverage
For relevant units, check:
- Expected path.
- Expected failures.
- Important edge cases.
- Domain rules.
- Boundary validation.
- Regression cases for fixed bugs.

Coverage percentage is a signal, not proof of quality.
Do not require one universal percentage unless the repository already does.

### 9.3 Mocks
Mock external boundaries or costly dependencies.
Do not mock every internal method.
A test that breaks after harmless internal refactoring is probably too coupled to implementation.

### 9.4 Snapshots
Avoid snapshots for ordinary logic.
Use them only when the serialized output itself is a stable, reviewable contract.

## 10. Comments

Maximum: 2 lines per comment block.

A useful comment explains:
- Why a non-obvious decision exists.
- A constraint the code cannot express.
- A short pointer to deeper documentation.

A bad comment repeats the code.

Allowed example:

```ts
// Normalizes provider errors into the domain contract.
// Docs: docs/payments/provider-error.md
```

Do not place paragraphs inside source files.

## 11. Documentation contract

Documentation is mandatory for maintained code, including:
- Public modules.
- Internal modules.
- Functions.
- Helpers.
- Commons.
- Hooks.
- Tools.
- Harnesses.
- Schemas.
- Adapters.
- Test infrastructure.
- Other maintained functionality.

Mirror the source tree:

```text
src/
  auth/
    token-service.ts
    parse-token.ts

docs/
  auth/
    token-service.md
    parse-token.md
```

One documentation page may cover all functions in its matching source file.
The page must not omit small helpers merely because they are simple.

### 11.1 Required page sections

Use these sections when they apply:

1. **Purpose**
   - What this file exists to do.
   - Why the application needs it.

2. **Before you read this**
   - Define the minimum concepts the reader needs.
   - Never assume a technical term before introducing it.

3. **How it works**
   - Explain the flow in normal prose.
   - Prefer small steps.

4. **Functions and pieces**
   - Cover every maintained function/helper/schema/export.
   - Explain input, output, side effects, and important decisions.

5. **Example**
   - Use the smallest realistic example that teaches the idea.

6. **Errors and edge cases**
   - Explain what can fail and how the code responds.

7. **Connections**
   - Explain what calls this file and what this file depends on.

Do not add empty sections only to satisfy a template.

### 11.2 Teaching style

Write as if teaching a technically curious 15-year-old.

Rules:
- Use plain technical language.
- Define a term before relying on it.
- One idea at a time.
- Prefer concrete examples before abstractions.
- Explain why before implementation detail when possible.
- Avoid agent jargon.
- Avoid unexplained acronyms.
- Avoid phrases such as "obviously", "simply", or "as everyone knows".
- Do not assume the reader knows the architecture already.
- Stay concise. Clarity does not require long prose.

### 11.3 What counts as documented
A source file is documented only when:
- The mirrored docs page exists.
- The page explains the file's responsibility.
- Every maintained function/helper/schema/export is covered.
- Important inputs, outputs, errors, side effects, and relationships are explained.
- The prose is understandable without reading the implementation first.

Missing coverage is a blocker under this skill's contract.

## 12. Naming

Prefer names that reveal purpose and domain meaning.
Avoid vague names such as `data`, `item`, `manager`, `helper`, or `utils` when a more precise responsibility exists.

Longer clear names are better than short ambiguous names.

## 13. Errors

Use explicit domain errors when callers need to distinguish failure kinds.
Do not use arbitrary strings as a hidden error protocol.

Catch an error only when the current layer can:
- recover,
- translate it,
- add meaningful context,
- or perform required cleanup.

Otherwise let it propagate to the correct boundary.

## 14. Legacy code

Do not demand a full rewrite because one old file was touched.

Policy:
- Report existing blockers and warnings.
- Do not make untouched areas worse.
- Improve touched code when the change is reasonably local.
- Avoid unrelated cleanup inside a focused change.
- Document known debt when it affects understanding.

## 15. Generated and vendor code

Exclude generated or third-party source from manual architecture/documentation rules unless the repository maintains local behavior inside it.
Wrappers, adapters, patches, or custom integrations remain in scope.

## 16. Final audit format

Keep the report short.

```text
VERDICT: PASS | PASS WITH WARNINGS | FAIL

BLOCKERS
- path:line — issue — why it matters — suggested correction

WARNINGS
- path:line — issue — why it matters — suggested correction

NOTES
- path:line — optional improvement

CHECKS
- TypeScript: pass/fail/not available
- Lint: pass/fail/not available
- Jasmine: pass/fail/not available
- Coverage: result/not available
- Duplication: result/not available
- Docs: complete/incomplete
```

Do not bury the verdict in prose.

## 17. Tooling policy

Use the repository's tools before recommending new ones.

Typical checks may include:
- TypeScript compiler.
- ESLint.
- Jasmine.
- Coverage tooling.
- Duplication detectors.
- Circular dependency detectors.

Tool names and versions change.
Read the repository configuration instead of assuming a version or command.

If tooling is missing:
1. State what cannot be validated deterministically.
2. Recommend the smallest suitable addition.
3. Do not install or reconfigure anything unless explicitly requested.

## 18. Approval rules

- `FAIL`: one or more blockers.
- `PASS WITH WARNINGS`: no blockers, at least one warning.
- `PASS`: no blockers and no meaningful warnings.

Notes do not prevent `PASS`.
