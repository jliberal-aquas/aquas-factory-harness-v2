import type {ZodType} from "zod";
import {InvalidPayloadError, parseJson} from "../common/json.ts";
import {validatePayload} from "../common/zod.ts";
import {blockAgentStop} from "./responses.ts";


export function validateContractStop<T>(
  message: string,
  schema: ZodType<T>,
  label: string,
): unknown {
  try {
    const payload =
      parseJson(
        message,
        label,
      );
    validatePayload(
      schema,
      payload,
      label,
    );
    // Sin respuesta = Claude Code permite terminar.
    return undefined;
  } catch (error) {
    if (
      error instanceof InvalidPayloadError
    ) {
      return blockAgentStop(
        error.message,
      );
    }
    throw error;
  }
}