import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PreToolUse } from "../../contracts/claude/PreToolUse.ts";
import { ManageWorkerPretoolUse } from "./ManageWorkerPretoolUse.ts";

const scratchBase = join(process.cwd(), ".scratch", "test-tmp");

async function conProyectoTemporal<T>(
  fn: (raiz: string) => Promise<T>,
): Promise<T> {
  mkdirSync(scratchBase, { recursive: true });
  const raiz = mkdtempSync(join(scratchBase, "worker-pretool-"));
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
  overrides: Record<string, unknown> = {},
): string {
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
    ...overrides,
  };

  const relativePath = ".aquas/tareas/T-1/TA-1.json";
  mkdirSync(join(raiz, ".aquas", "tareas", "T-1"), { recursive: true });
  writeFileSync(join(raiz, ...relativePath.split("/")), JSON.stringify(tarea));
  return relativePath;
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
    tool_input: {},
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

test("Bash autorizado pasa", async () => {
  await conProyectoTemporal(async (raiz) => {
    const contractPath = escribirTarea(raiz);
    const transcriptPath = escribirTranscript(raiz, "a1", contractPath);
    const resultado = await ManageWorkerPretoolUse(
      input(raiz, transcriptPath, {
        tool_name: "Bash",
        tool_input: { command: "pnpm run verificar" },
      }),
    );
    assert.equal(resultado, undefined);
  });
});

test("Bash no autorizado deniega", async () => {
  await conProyectoTemporal(async (raiz) => {
    const contractPath = escribirTarea(raiz);
    const transcriptPath = escribirTranscript(raiz, "a1", contractPath);
    const resultado = await ManageWorkerPretoolUse(
      input(raiz, transcriptPath, {
        tool_name: "Bash",
        tool_input: { command: "rm -rf /" },
      }),
    );
    assert.equal(esDenegado(resultado), true);
  });
});

test("Bash compuesto con segmento no autorizado deniega", async () => {
  await conProyectoTemporal(async (raiz) => {
    const contractPath = escribirTarea(raiz);
    const transcriptPath = escribirTranscript(raiz, "a1", contractPath);
    const resultado = await ManageWorkerPretoolUse(
      input(raiz, transcriptPath, {
        tool_name: "Bash",
        tool_input: { command: "pnpm run verificar && rm -rf /" },
      }),
    );
    assert.equal(esDenegado(resultado), true);
  });
});

test("escritura en ruta prohibida deniega", async () => {
  await conProyectoTemporal(async (raiz) => {
    const contractPath = escribirTarea(raiz);
    const transcriptPath = escribirTranscript(raiz, "a1", contractPath);
    const resultado = await ManageWorkerPretoolUse(
      input(raiz, transcriptPath, {
        tool_name: "Edit",
        tool_input: {
          file_path: join(raiz, ".agentic-resources", "contracts", "x.ts"),
        },
      }),
    );
    assert.equal(esDenegado(resultado), true);
  });
});

test("escritura en ruta permitida pasa", async () => {
  await conProyectoTemporal(async (raiz) => {
    const contractPath = escribirTarea(raiz);
    const transcriptPath = escribirTranscript(raiz, "a1", contractPath);
    const resultado = await ManageWorkerPretoolUse(
      input(raiz, transcriptPath, {
        tool_name: "Edit",
        tool_input: { file_path: join(raiz, "src", "x.ts") },
      }),
    );
    assert.equal(resultado, undefined);
  });
});

test("lectura en ruta prohibida pasa", async () => {
  await conProyectoTemporal(async (raiz) => {
    const contractPath = escribirTarea(raiz);
    const transcriptPath = escribirTranscript(raiz, "a1", contractPath);
    const resultado = await ManageWorkerPretoolUse(
      input(raiz, transcriptPath, {
        tool_name: "Read",
        tool_input: {
          file_path: join(raiz, ".agentic-resources", "contracts", "x.ts"),
        },
      }),
    );
    assert.equal(resultado, undefined);
  });
});

test("Tarea no resoluble con agent_type de worker deniega", async () => {
  await conProyectoTemporal(async (raiz) => {
    const transcriptPath = join(raiz, "agent-a1.jsonl");
    const resultado = await ManageWorkerPretoolUse(
      input(raiz, transcriptPath, {
        tool_name: "Bash",
        tool_input: { command: "pnpm run verificar" },
      }),
    );
    assert.equal(esDenegado(resultado), true);
  });
});
