import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { SubagentStop } from "../../contracts/claude/AgentStop.ts";
import { ManageOrchestratorStop } from "./ManageOrchestratorStop.ts";

const scratchBase = join(process.cwd(), ".scratch", "test-tmp");

async function conProyectoTemporal(
  fn: (raiz: string) => Promise<void>,
): Promise<void> {
  mkdirSync(scratchBase, { recursive: true });
  const raiz = mkdtempSync(join(scratchBase, "orchestrator-stop-"));
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
    agent_type: "orchestrator",
    agent_transcript_path: "t.jsonl",
  };
}

const cierreValido = JSON.stringify({
  turno_id: "T-1",
  estado: "completada",
  verificacion: { estado: "paso" },
});

test("rama A: stop_hook_active false y CierreTurno invalido bloquea", async () => {
  const resultado = await ManageOrchestratorStop(input("{bad json", false));
  assert.equal((resultado as { decision: string }).decision, "block");
});

test("rama B: stop_hook_active true y CierreTurno invalido registra agotamiento", async () => {
  await conProyectoTemporal(async (raiz) => {
    const resultado = await ManageOrchestratorStop(input("{bad json", true));
    assert.equal(resultado, undefined);

    const jsonl = readFileSync(join(raiz, ".aquas", "denegaciones.jsonl"), "utf8");
    const evento = JSON.parse(jsonl.trim().split("\n").pop()!);
    assert.equal(evento.agotado_reintento, true);
  });
});

test("rama C: CierreTurno valido no bloquea ni registra", async () => {
  await conProyectoTemporal(async (raiz) => {
    assert.equal(await ManageOrchestratorStop(input(cierreValido, false)), undefined);
    assert.equal(await ManageOrchestratorStop(input(cierreValido, true)), undefined);

    assert.throws(() => readFileSync(join(raiz, ".aquas", "denegaciones.jsonl")));
  });
});
