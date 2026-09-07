import type {SubagentStop} from "../../contracts/claude/AgentStop.ts";
import {Entrega} from "../../contracts/worker/feedback.ts";
import {validateContractStop} from "../claude/contract-stop.ts";


export function ManageWorkerStop(
  input: SubagentStop,
): unknown {

  return validateContractStop(
    input.last_assistant_message,
    Entrega,
    "Entrega",
    input.stop_hook_active,
  );
}