import type { AgentStop } from "../../contracts/claude/AgentStop.ts";
import { ManageOrchestratorStop } from "./ManageOrchestratorStop.ts";

export async function ManageAgentStop(
  input: AgentStop
): Promise<unknown> {

  // MAIN: Human Gate
  if (input.hook_event_name === "Stop") {
    // Más adelante:
    // return ManageHumanGateStop(input);
    return;
  }

  // Desde aquí TypeScript YA SABE:
  // input es SubagentStop.

  if (input.agent_type === "orchestrator") {
    return ManageOrchestratorStop(input);
  }

  // Más adelante:
  // return ManageWorkerStop(input);
  return;
}