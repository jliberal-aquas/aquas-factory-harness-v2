import type {
  PreToolUseAgent,
} from "../../contracts/claude/PreToolUseAgent.ts";
import { registrarDenegacion } from "../observability/registrarDenegacion.ts";

export function denyPreToolUse(
  reason: string,
) {
  registrarDenegacion({
    tipo: "pretooluse",
    motivo: reason,
  });

  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  } as const;
}

export function allowAgentWithPrompt(
  input: PreToolUseAgent,
  prompt: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",

      updatedInput: {
        ...input.tool_input,
        ...overrides,
        prompt,
      },
    },
  } as const;
}

export function blockAgentStop(
  reason: string,
) {
  registrarDenegacion({
    tipo: "agentstop",
    motivo: reason,
  });

  return {
    decision: "block",
    reason,
  } as const;
}

export function registerAgentStopRetryExhausted(
  reason: string,
): void {
  registrarDenegacion({
    tipo: "agentstop",
    motivo: reason,
    agotado_reintento: true,
  });
}