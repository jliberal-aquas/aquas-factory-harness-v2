import type {ZodType} from "zod";
import {InvalidPayloadError, parseJson} from "../common/json.ts";
import {validatePayload} from "../common/zod.ts";
import {blockAgentStop, registerAgentStopRetryExhausted} from "./responses.ts";


export function validateContractStop<T>(
  message: string,
  schema: ZodType<T>,
  label: string,
  stopHookActive: boolean,
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
      // stopHookActive true = ya hubo reintento: no bloquear de nuevo.
      if (stopHookActive) {
        registerAgentStopRetryExhausted(
          error.message,
        );
        return undefined;
      }
      return blockAgentStop(
        error.message,
      );
    }
    throw error;
  }
}