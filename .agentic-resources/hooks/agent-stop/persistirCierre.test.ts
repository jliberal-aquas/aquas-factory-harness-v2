import { test } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { SubagentStop } from "../../contracts/claude/AgentStop.ts";
import { ManageWorkerStop } from "./ManageWorkerStop.ts";
import { ManageOrchestratorStop } from "./ManageOrchestratorStop.ts";
import { persistirCierreTurno, persistirEntrega } from "./persistirCierre.ts";
import { writeTareaPathCache } from "../pretool-use/tarea-path-cache.ts";
import type { Entrega } from "../../contracts/worker/feedback.ts";
import type { CierreTurno } from "../../contracts/orchestrator/feedback.ts";

const scratchBase = join(process.cwd(), ".scratch", "test-tmp");

async function conProyectoTemporal(
  fn: (raiz: string) => Promise<void>,
): Promise<void> {
  mkdirSync(scratchBase, { recursive: true });
  const raiz = mkdtempSync(join(scratchBase, "persistir-cierre-"));
  const original = process.env.CLAUDE_PROJECT_DIR;
  process.env.CLAUDE_PROJECT_DIR = raiz;
  try {
    await fn(raiz);
  } finally {
    process.env.CLAUDE_PROJECT_DIR = original;
    rmSync(raiz, { recursive: true, force: true });
  }
}

function workerInput(mensaje: string): SubagentStop {
  return {
    session_id: "s1",
    cwd: process.cwd(),
    stop_hook_active: false,
    last_assistant_message: mensaje,
    hook_event_name: "SubagentStop",
    agent_id: "a1",
    agent_type: "builder",
    agent_transcript_path: "t.jsonl",
  };
}

function orchestratorInput(mensaje: string): SubagentStop {
  return {
    session_id: "s1",
    cwd: process.cwd(),
    stop_hook_active: false,
    last_assistant_message: mensaje,
    hook_event_name: "SubagentStop",
    agent_id: "a1",
    agent_type: "orchestrator",
    agent_transcript_path: "t.jsonl",
  };
}

const entregaValida = JSON.stringify({
  tarea_id: "TA-1",
  estado: "completada",
});

const cierreValido = JSON.stringify({
  turno_id: "T-1",
  estado: "completada",
  verificacion: { estado: "paso" },
});

const cierreInvalido = JSON.stringify({
  turno_id: "T-1",
  estado: "completada",
});

test("persistirEntrega escribe Entrega valida en .aquas/entregas/<turno_id>/<tarea_id>.json", async () => {
  await conProyectoTemporal(async (raiz) => {
    const entrega: Entrega = {
      tarea_id: "TA-1",
      estado: "completada",
      resultados: [],
      archivos_tocados: [],
      bloqueos: [],
      pendientes: [],
      evidencias: [],
    };

    persistirEntrega(raiz, entrega, "T-1");

    const contenido = readFileSync(
      join(raiz, ".aquas", "entregas", "T-1", "TA-1.json"),
      "utf8",
    );
    assert.deepEqual(JSON.parse(contenido).tarea_id, "TA-1");
  });
});

test("persistirCierreTurno escribe CierreTurno valido en .aquas/cierres/<turno_id>.json", async () => {
  await conProyectoTemporal(async (raiz) => {
    const cierre: CierreTurno = {
      turno_id: "T-1",
      estado: "completada",
      verificacion: { estado: "paso" },
      resultados: [],
      archivos_tocados: [],
      bloqueos: [],
      pendientes: [],
      evidencias: [],
      entregas: [],
    };

    persistirCierreTurno(raiz, cierre);

    const contenido = readFileSync(
      join(raiz, ".aquas", "cierres", "T-1.json"),
      "utf8",
    );
    assert.deepEqual(JSON.parse(contenido).turno_id, "T-1");
  });
});

test("fallo de escritura de Entrega no altera la decision del hook", async () => {
  await conProyectoTemporal(async (raiz) => {
    await writeTareaPathCache(raiz, "a1", ".aquas/tareas/T-1/TA-1.json");

    mkdirSync(join(raiz, ".aquas", "entregas"), { recursive: true });
    writeFileSync(join(raiz, ".aquas", "entregas", "T-1"), "bloqueo");

    const resultado = await ManageWorkerStop(workerInput(entregaValida));
    assert.equal(resultado, undefined);
    assert.equal(
      existsSync(join(raiz, ".aquas", "entregas", "T-1", "TA-1.json")),
      false,
    );
  });
});

test("CierreTurno invalido no se persiste", async () => {
  await conProyectoTemporal(async (raiz) => {
    const resultado = await ManageOrchestratorStop(
      orchestratorInput(cierreInvalido),
    );
    assert.equal((resultado as { decision: string }).decision, "block");
    assert.equal(existsSync(join(raiz, ".aquas", "cierres", "T-1.json")), false);
  });
});

test("integracion: ManageOrchestratorStop persiste CierreTurno valido", async () => {
  await conProyectoTemporal(async (raiz) => {
    const resultado = await ManageOrchestratorStop(
      orchestratorInput(cierreValido),
    );
    assert.equal(resultado, undefined);

    const contenido = readFileSync(
      join(raiz, ".aquas", "cierres", "T-1.json"),
      "utf8",
    );
    assert.deepEqual(JSON.parse(contenido).turno_id, "T-1");
  });
});
