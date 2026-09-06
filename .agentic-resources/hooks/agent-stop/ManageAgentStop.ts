import type { AgentStop } from "../../contracts/claude/AgentStop.ts";
import { ManageOrchestratorStop } from "./ManageOrchestratorStop.ts";
import {  } from "./ManageHumanGateStop.ts";
import {ManageHumanGateStop} from "./ManageHumanGateStop.ts";
import {ManageWorkerStop} from "./ManageWorkerStop.ts";

export async function ManageAgentStop(
  input: AgentStop,
): Promise<unknown> {
  // MAIN → Human Gate
  if (input.hook_event_name === "Stop") {
    return ManageHumanGateStop(input);
  }
  // Desde aquí input es SubagentStop.
  // Orchestrator → Human Gate
  if (input.agent_type === "orchestrator") {
    return ManageOrchestratorStop(input);
  }
  // Cualquier otro subagente es un worker.
  return ManageWorkerStop(input);
}