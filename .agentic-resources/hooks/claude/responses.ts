import type {
  PreToolUseAgent,
} from "../../contracts/claude/PreToolUseAgent.ts";

export function denyPreToolUse(
  reason: string,
) {
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
  return {
    decision: "block",
    reason,
  } as const;
}