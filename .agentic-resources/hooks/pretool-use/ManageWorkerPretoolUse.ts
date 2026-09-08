import type {PreToolUse} from "../../contracts/claude/PreToolUse.ts";
import {denyPreToolUse} from "../claude/responses.ts";
import {InvalidPayloadError} from "../common/json.ts";
import {resolveProjectRoot} from "../common/project-root.ts";
import {resolveWorkerTarea} from "./resolve-worker-tarea.ts";
import {isBashCommandAuthorized} from "./authorize-bash-command.ts";
import {isWritePathForbidden} from "./authorize-write-path.ts";

const WRITE_TOOLS = new Set([
  "Edit",
  "Write",
  "NotebookEdit",
]);

function extractTargetPath(
  toolInput: Record<string, unknown>,
): string | undefined {
  const value =
    toolInput.file_path ??
    toolInput.notebook_path;

  return typeof value === "string" ?
    value :
    undefined;
}

export async function ManageWorkerPretoolUse(
  input: PreToolUse,
): Promise<unknown> {
  let tarea;

  try {
    tarea = await resolveWorkerTarea(input);
  } catch (error) {
    const motivo =
      error instanceof InvalidPayloadError ?
        error.message :
        "Tarea del worker no resoluble.";

    return denyPreToolUse(motivo, input.cwd);
  }

  if (input.tool_name === "Bash") {
    const command =
      typeof input.tool_input.command === "string" ?
        input.tool_input.command :
        "";

    if (
      !isBashCommandAuthorized(
        command,
        tarea.ejecucion.comandos,
      )
    ) {
      return denyPreToolUse(
        `Comando no autorizado por Tarea.ejecucion.comandos: ${command}`,
        input.cwd,
      );
    }

    return undefined;
  }

  if (WRITE_TOOLS.has(input.tool_name)) {
    const targetPath =
      extractTargetPath(input.tool_input);

    if (targetPath === undefined) {
      return denyPreToolUse(
        `${input.tool_name} sin ruta destino identificable.`,
        input.cwd,
      );
    }

    const projectRoot =
      resolveProjectRoot(input.cwd);

    if (
      isWritePathForbidden(
        projectRoot,
        targetPath,
        tarea.rutas_prohibidas,
      )
    ) {
      return denyPreToolUse(
        `Ruta prohibida por Tarea.rutas_prohibidas: ${targetPath}`,
        input.cwd,
      );
    }

    return undefined;
  }

  return undefined;
}
