import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { resolveProjectRoot } from "../common/project-root.ts";

export type TipoDenegacion = "pretooluse" | "agentstop";

export interface DenegacionEvento {
  tipo: TipoDenegacion;
  motivo: string;
  agente?: string;
  turno_id?: string;
  tarea_id?: string;
}

export function registrarDenegacion(
  evento: DenegacionEvento,
): void {
  try {
    const raiz = resolveProjectRoot(process.cwd());
    const dirAquas = join(raiz, ".aquas");
    const destino = join(dirAquas, "denegaciones.jsonl");

    mkdirSync(dirAquas, { recursive: true });

    const linea = {
      creada_en: new Date().toISOString(),
      tipo: evento.tipo,
      motivo: evento.motivo,
      ...(evento.agente !== undefined && { agente: evento.agente }),
      ...(evento.turno_id !== undefined && { turno_id: evento.turno_id }),
      ...(evento.tarea_id !== undefined && { tarea_id: evento.tarea_id }),
    };

    appendFileSync(destino, JSON.stringify(linea) + "\n");
  } catch {
    // Absorbido: el registro nunca propaga error.
  }
}
