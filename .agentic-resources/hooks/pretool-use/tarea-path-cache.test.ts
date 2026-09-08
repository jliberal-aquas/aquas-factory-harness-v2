import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PreToolUse } from "../../contracts/claude/PreToolUse.ts";
import { ManageWorkerPretoolUse } from "./ManageWorkerPretoolUse.ts";

const scratchBase = join(process.cwd(), ".scratch", "test-tmp");

async function conProyectoTemporal<T>(
  fn: (raiz: string) => Promise<T>,
): Promise<T> {
  mkdirSync(scratchBase, { recursive: true });
  const raiz = mkdtempSync(join(scratchBase, "tarea-path-cache-"));
  const original = process.env.CLAUDE_PROJECT_DIR;
  process.env.CLAUDE_PROJECT_DIR = raiz;
  try {
    return await fn(raiz);
  } finally {
    process.env.CLAUDE_PROJECT_DIR = original;
    rmSync(raiz, { recursive: true, force: true });
  }
}

function escribirTarea(
  raiz: string,
  relativePath: string,
): void {
  const tarea = {
    tarea_id: "TA-1",
    creada_en: new Date().toISOString(),
    turno_id: "T-1",
    turno_ref: ".aquas/turnos/T-1.json",
    worker: "builder",
    objetivo: "objetivo",
    outcome_esperado: "outcome",
    alcance: { permite: [], exige: [], preexistentes: [] },
    ejecucion: { comandos: ["pnpm run verificar"] },
    criterios_terminado: ["listo"],
    entradas: [],
    prohibido: [],
    rutas_prohibidas: [".agentic-resources/contracts/"],
  };

  const partes = relativePath.split("/");
  mkdirSync(join(raiz, ...partes.slice(0, -1)), { recursive: true });
  writeFileSync(join(raiz, ...partes), JSON.stringify(tarea));
}

function escribirTranscript(
  raiz: string,
  agentId: string,
  contractPath: string,
): string {
  const transcriptPath = join(raiz, `agent-${agentId}.jsonl`);
  const linea = {
    type: "user",
    parentUuid: null,
    message: { content: contractPath },
  };
  writeFileSync(transcriptPath, `${JSON.stringify(linea)}\n`);
  return transcriptPath;
}

function escribirCache(
  raiz: string,
  agentId: string,
  tareaPath: string,
): void {
  mkdirSync(join(raiz, ".aquas", "agentes"), { recursive: true });
  writeFileSync(
    join(raiz, ".aquas", "agentes", `${agentId}.json`),
    JSON.stringify({ tareaPath }),
  );
}

function input(
  raiz: string,
  transcriptPath: string,
  overrides: Record<string, unknown> = {},
): PreToolUse {
  return {
    session_id: "s1",
    cwd: raiz,
    hook_event_name: "PreToolUse",
    agent_id: "a1",
    agent_type: "builder",
    tool_name: "Bash",
    tool_input: { command: "pnpm run verificar" },
    transcript_path: transcriptPath,
    ...overrides,
  } as PreToolUse;
}

function esDenegado(resultado: unknown): boolean {
  const decision = (
    resultado as {
      hookSpecificOutput?: { permissionDecision?: string };
    }
  ).hookSpecificOutput?.permissionDecision;
  return decision === "deny";
}

test("cache hit reutiliza la ruta sin transcript disponible", async () => {
  await conProyectoTemporal(async (raiz) => {
    const contractPath = ".aquas/tareas/T-1/TA-1.json";
    escribirTarea(raiz, contractPath);
    escribirCache(raiz, "a1", contractPath);
    const transcriptPathInexistente = join(raiz, "agent-a1.jsonl");
    const resultado = await ManageWorkerPretoolUse(
      input(raiz, transcriptPathInexistente),
    );
    assert.equal(resultado, undefined);
  });
});

test("cache miss resuelve por transcript y persiste", async () => {
  await conProyectoTemporal(async (raiz) => {
    const contractPath = ".aquas/tareas/T-1/TA-1.json";
    escribirTarea(raiz, contractPath);
    const transcriptPath = escribirTranscript(raiz, "a1", contractPath);
    const resultado = await ManageWorkerPretoolUse(
      input(raiz, transcriptPath),
    );
    assert.equal(resultado, undefined);
    const cacheFile = join(raiz, ".aquas", "agentes", "a1.json");
    assert.equal(existsSync(cacheFile), true);
    const persistido = JSON.parse(readFileSync(cacheFile, "utf8"));
    assert.equal(persistido.tareaPath, contractPath);
  });
});

test("cache apuntando a Tarea inexistente deniega", async () => {
  await conProyectoTemporal(async (raiz) => {
    escribirCache(raiz, "a1", ".aquas/tareas/T-1/no-existe.json");
    const transcriptPath = join(raiz, "agent-a1.jsonl");
    const resultado = await ManageWorkerPretoolUse(
      input(raiz, transcriptPath),
    );
    assert.equal(esDenegado(resultado), true);
  });
});
