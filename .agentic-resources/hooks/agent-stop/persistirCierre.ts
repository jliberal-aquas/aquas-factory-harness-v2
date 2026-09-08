import {mkdirSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {resolveProjectRoot} from "../common/project-root.ts";
import {registrarDenegacion} from "../observability/registrarDenegacion.ts";
import type {Entrega} from "../../contracts/worker/feedback.ts";
import type {CierreTurno} from "../../contracts/orchestrator/feedback.ts";

function sanearTimestamp(
  iso: string,
): string {
  return iso.replace(/[:.]/g, "-");
}

function escribirJson(
  raiz: string,
  segmentos: string[],
  contenido: unknown,
): void {
  const dir = join(raiz, ...segmentos.slice(0, -1));
  const destino = join(raiz, ...segmentos);

  mkdirSync(dir, {recursive: true});
  writeFileSync(destino, JSON.stringify(contenido, null, 2));
}

function escribirSinTurno(
  raiz: string,
  contenido: unknown,
  motivo: string,
): void {
  const nombre =
    `${sanearTimestamp(new Date().toISOString())}.json`;

  escribirJson(
    raiz,
    [".aquas", "cierres", "sin-turno", nombre],
    contenido,
  );
  registrarDenegacion({tipo: "agentstop", motivo});
}

export function persistirEntrega(
  cwd: string,
  entrega: Entrega,
  turnoId: string | undefined,
): void {
  try {
    const raiz = resolveProjectRoot(cwd);

    if (turnoId === undefined) {
      escribirSinTurno(
        raiz,
        entrega,
        `No se pudo determinar turno_id para Entrega ${entrega.tarea_id}.`,
      );
      return;
    }

    escribirJson(
      raiz,
      [".aquas", "entregas", turnoId, `${entrega.tarea_id}.json`],
      entrega,
    );
  } catch {
    // Absorbido: la persistencia nunca propaga error.
  }
}

export function persistirCierreTurno(
  cwd: string,
  cierre: CierreTurno,
): void {
  try {
    const raiz = resolveProjectRoot(cwd);

    escribirJson(
      raiz,
      [".aquas", "cierres", `${cierre.turno_id}.json`],
      cierre,
    );
  } catch {
    // Absorbido: la persistencia nunca propaga error.
  }
}
