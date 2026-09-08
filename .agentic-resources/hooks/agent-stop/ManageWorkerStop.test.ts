import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { SubagentStop } from "../../contracts/claude/AgentStop.ts";
import { ManageWorkerStop } from "./ManageWorkerStop.ts";
import { writeTareaPathCache } from "../pretool-use/tarea-path-cache.ts";

const scratchBase = join(process.cwd(), ".scratch", "test-tmp");

async function conProyectoTemporal(
  fn: (raiz: string) => Promise<void>,
): Promise<void> {
  mkdirSync(scratchBase, { recursive: true });
  const raiz = mkdtempSync(join(scratchBase, "worker-stop-"));
  const original = process.env.CLAUDE_PROJECT_DIR;
  process.env.CLAUDE_PROJECT_DIR = raiz;
  try {
    await fn(raiz);
  } finally {
    process.env.CLAUDE_PROJECT_DIR = original;
    rmSync(raiz, { recursive: true, force: true });
  }
}

function input(mensaje: string, stopHookActive: boolean): SubagentStop {
  return {
    session_id: "s1",
    cwd: process.cwd(),
    stop_hook_active: stopHookActive,
    last_assistant_message: mensaje,
    hook_event_name: "SubagentStop",
    agent_id: "a1",
    agent_type: "builder",
    agent_transcript_path: "t.jsonl",
  };
}

const entregaValida = JSON.stringify({
  tarea_id: "TA-1",
  estado: "completada",
});

test("rama A: stop_hook_active false y Entrega invalida bloquea", async () => {
  const resultado = await ManageWorkerStop(input("{bad json", false));
  assert.equal((resultado as { decision: string }).decision, "block");
});

test("rama B: stop_hook_active true y Entrega invalida registra agotamiento", async () => {
  await conProyectoTemporal(async (raiz) => {
    const resultado = await ManageWorkerStop(input("{bad json", true));
    assert.equal(resultado, undefined);

    const jsonl = readFileSync(join(raiz, ".aquas", "denegaciones.jsonl"), "utf8");
    const evento = JSON.parse(jsonl.trim().split("\n").pop()!);
    assert.equal(evento.agotado_reintento, true);
  });
});

test("rama C: Entrega valida no bloquea ni registra", async () => {
  await conProyectoTemporal(async (raiz) => {
    await writeTareaPathCache(raiz, "a1", ".aquas/tareas/T-1/TA-1.json");

    assert.equal(await ManageWorkerStop(input(entregaValida, false)), undefined);
    assert.equal(await ManageWorkerStop(input(entregaValida, true)), undefined);

    assert.throws(() => readFileSync(join(raiz, ".aquas", "denegaciones.jsonl")));
  });
});
