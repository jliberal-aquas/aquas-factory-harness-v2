# Examples

These examples show the expected review and documentation style.

## 1. Zod at an external boundary

Good:

```ts
const UserPayload = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

export function parseUserPayload(input: unknown) {
  return UserPayload.parse(input);
}
```

Why:
The input begins as `unknown`, because an external caller can send anything.
Zod checks the value once. After that boundary, the domain can use the trusted result.

Bad:

```ts
export function renameUser(user: User) {
  return UserSchema.parse({ ...user, name: user.name.trim() });
}
```

Why:
If `User` is already a trusted domain value, parsing it again adds runtime work without adding useful trust.

## 2. `any`

Bad:

```ts
export function readId(input: any) {
  return input.id;
}
```

Better:

```ts
export function readId(input: unknown) {
  const value = z.object({ id: z.string() }).parse(input);
  return value.id;
}
```

## 3. Duplication

Possible warning:

```ts
function priceForWeb(user: User) {
  return user.vip ? 80 : 100;
}

function priceForMobile(account: Account) {
  return account.isVip ? 80 : 100;
}
```

The lines differ, but both may encode the same pricing rule.
The review should ask whether there is one domain concept that should own that rule.

Do not extract a shared function merely because two lines look alike.
First confirm that both pieces represent the same business behavior.

## 4. Comments

Good:

```ts
// Provider codes are translated before entering domain logic.
// Docs: docs/payments/provider-errors.md
```

Bad:

```ts
// Check if status is failed.
if (status === "failed") {
```

The bad comment repeats what the code already says.

## 5. Documentation page

For:

```text
src/auth/parse-token.ts
```

create:

```text
docs/auth/parse-token.md
```

Example content:

```md
# Parse token

## Purpose

This file turns an untrusted token string into information the rest of the
authentication code can safely use.

A token is a short piece of text used to carry identity information between
systems. This file does not decide whether a user may access a feature. Its
job is only to read and validate the token.

## Before you read this

A **boundary** is the place where data enters our trusted application code.
Data at a boundary must be checked before the rest of the program relies on it.

## How it works

1. The function receives text from outside the trusted domain.
2. It decodes the text.
3. Zod checks the decoded shape.
4. The validated value is returned to the authentication service.

## Functions and pieces

### `parseToken`

Input: an unknown token string.

Output: a validated token payload.

It can fail when the token cannot be decoded or when required fields are
missing.

## Example

`parseToken(token)` returns the validated identity fields used by the
authentication flow.

## Connections

The HTTP authentication adapter calls this file.
The authentication domain receives its validated output.
```

## 6. Jasmine behavior test

Good:

```ts
describe("calculateDiscount", () => {
  it("returns the VIP price for a VIP customer", () => {
    const result = calculateDiscount({ isVip: true });

    expect(result).toBe(20);
  });

  it("returns no discount for a regular customer", () => {
    const result = calculateDiscount({ isVip: false });

    expect(result).toBe(0);
  });
});
```

Avoid tests that only prove internal calls:

```ts
expect(privateHelper).toHaveBeenCalledTimes(1);
```

unless the call itself is the public contract.

## 7. Audit output

```text
VERDICT: FAIL

BLOCKERS
- src/http/create-user.ts:18 — request body used before runtime validation — external data is untrusted — validate once with Zod at the HTTP boundary
- src/auth/token.ts — missing docs/auth/token.md — maintained source must have mirrored documentation

WARNINGS
- src/orders/order-service.ts:42 — pricing rule duplicates checkout logic — both paths can drift — move the shared domain rule to one owner

NOTES
- src/orders/order-service.ts:11 — `data` could be named `orderInput`

CHECKS
- TypeScript: pass
- Lint: pass
- Jasmine: pass
- Coverage: 91%
- Duplication: 2 candidate blocks
- Docs: incomplete
```
