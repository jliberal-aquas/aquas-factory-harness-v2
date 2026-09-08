import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { esRaizUtilizable } from "./esRaizUtilizable.ts";

export function registrarPayloadPreToolUse(
  payload: Record<string, unknown>,
): void {
  const raiz = payload.cwd;

  if (!esRaizUtilizable(raiz)) {
    return;
  }

  try {
    const dirAquas = join(raiz, ".aquas");
    const destino = join(dirAquas, "payloads.jsonl");

    mkdirSync(dirAquas, { recursive: true });

    const claves = Object.keys(payload).sort();
    const tool_name = payload.tool_name;
    const agent_type = payload.agent_type;
    const agent_id = payload.agent_id;

    const linea = {
      creada_en: new Date().toISOString(),
      claves,
      tool_name,
      ...(agent_type !== undefined && { agent_type }),
      ...(agent_id !== undefined && { agent_id }),
    };

    appendFileSync(destino, JSON.stringify(linea) + "\n");
  } catch {
    // Absorbido: el registro nunca propaga error.
  }
}
