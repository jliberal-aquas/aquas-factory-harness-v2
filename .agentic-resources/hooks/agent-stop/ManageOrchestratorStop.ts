import type {SubagentStop} from "../../contracts/claude/AgentStop.ts";
import {CierreTurno} from "../../contracts/orchestrator/feedback.ts";

function bloquear(
  reason: string
) {
  return {
    decision: "block",
    reason
  } as const;
}

export async function ManageOrchestratorStop(
  input: SubagentStop
): Promise<unknown> {
  let raw: unknown;

  try {
    raw = JSON.parse(
      input.last_assistant_message
    );
  } catch {
    return bloquear(
      "Salida inválida. Devuelve únicamente JSON válido conforme a CierreTurno."
    );
  }

  const result =
    CierreTurno.safeParse(raw);

  if (!result.success) {
    const errores = result.error.issues
      .map((issue) => {
        const path =
          issue.path.join(".") || "<root>";

        return `${path}: ${issue.message}`;
      })
      .join("; ");

    return bloquear(
      `CierreTurno inválido: ${errores}`
    );
  }

  // Sin output = puede terminar.
  return undefined;
}