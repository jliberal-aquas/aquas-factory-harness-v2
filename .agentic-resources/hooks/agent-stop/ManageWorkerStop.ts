import {basename, dirname} from "node:path";
import type {SubagentStop} from "../../contracts/claude/AgentStop.ts";
import {Entrega} from "../../contracts/worker/feedback.ts";
import {validateContractStop} from "../claude/contract-stop.ts";
import {readTareaPathCache} from "../pretool-use/tarea-path-cache.ts";
import {resolveProjectRoot} from "../common/project-root.ts";
import {persistirEntrega} from "./persistirCierre.ts";

async function derivarTurnoId(
  cwd: string,
  agentId: string,
): Promise<string | undefined> {
  const raiz = resolveProjectRoot(cwd);
  const tareaPath = await readTareaPathCache(raiz, agentId);

  if (tareaPath === undefined) {
    return undefined;
  }

  const turnoId = basename(dirname(tareaPath));

  return turnoId.length > 0 ? turnoId : undefined;
}

async function persistirSiValida(
  input: SubagentStop,
): Promise<void> {
  let raw: unknown;

  try {
    raw = JSON.parse(input.last_assistant_message);
  } catch {
    return;
  }

  const result = Entrega.safeParse(raw);

  if (!result.success) {
    return;
  }

  const turnoId =
    await derivarTurnoId(input.cwd, input.agent_id);

  persistirEntrega(input.cwd, result.data, turnoId);
}

export async function ManageWorkerStop(
  input: SubagentStop,
): Promise<unknown> {
  const decision = validateContractStop(
    input.last_assistant_message,
    Entrega,
    "Entrega",
    input.stop_hook_active,
  );

  await persistirSiValida(input);

  return decision;
}
