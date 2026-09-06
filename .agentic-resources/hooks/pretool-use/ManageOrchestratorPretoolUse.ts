import type { PreToolUseAgent } from "../../contracts/claude/PreToolUseAgent.ts";

export async function ManageOrchestratorPretoolUse(
  input: PreToolUseAgent
): Promise<unknown> {
  // aquí procesaremos Human Gate → Orchestrator

  console.error(
    `[human-gate] delegando a ${input.tool_input.subagent_type}`
  );

  return undefined;
}