import type {
  ZodError,
  ZodType,
} from "zod";

import {
  InvalidPayloadError,
} from "./json.ts";

export function formatZodError(
  error: ZodError,
): string {
  return error.issues
    .map((issue) => {
      const path =
        issue.path.join(".") || "<root>";

      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export function validatePayload<T>(
  schema: ZodType<T>,
  payload: unknown,
  label: string,
): T {
  const result =
    schema.safeParse(payload);

  if (!result.success) {
    throw new InvalidPayloadError(
      `${label} inválido: ${formatZodError(result.error)}`,
    );
  }

  return result.data;
}