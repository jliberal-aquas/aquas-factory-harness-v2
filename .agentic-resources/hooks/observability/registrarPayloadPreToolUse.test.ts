import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { registrarPayloadPreToolUse } from "./registrarPayloadPreToolUse.ts";
import { ManagePreToolUse } from "../pretool-use/ManagePreToolUse.ts";
import type { PreToolUse } from "../../contracts/claude/PreToolUse.ts";

const scratchBase = join(process.cwd(), ".scratch", "test-tmp");

async function conProyectoTemporal<T>(
  fn: (raiz: string) => T | Promise<T>,
): Promise<T> {
  mkdirSync(scratchBase, { recursive: true });
  const raiz = mkdtempSync(join(scratchBase, "payload-log-"));
  try {
    return await fn(raiz);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
}

function inputBase(cwd: string, centinela: string): PreToolUse {
  return {
    session_id: "s1",
    cwd,
    hook_event_name: "PreToolUse",
    agent_id: "a1",
    agent_type: "builder",
    tool_name: "Write",
    tool_input: { valor: centinela },
  };
}

test("test 1: registra linea con claves esperadas bajo la raiz del payload", async () => {
  await conProyectoTemporal((raiz) => {
    registrarPayloadPreToolUse(inputBase(raiz, "secreto-1"));

    const jsonl = readFileSync(join(raiz, ".aquas", "payloads.jsonl"), "utf8");
    const evento = JSON.parse(jsonl.trim().split("\n").pop()!);

    assert.ok(typeof evento.creada_en === "string");
    assert.deepEqual(
      evento.claves,
      Object.keys(inputBase(raiz, "secreto-1")).sort(),
    );
    assert.equal(evento.tool_name, "Write");
    assert.equal(evento.agent_type, "builder");
    assert.equal(evento.agent_id, "a1");
  });
});

test("test 2: fallo de escritura no altera la decision del hook", async () => {
  await conProyectoTemporal(async (raiz) => {
    const inputHumanGate: PreToolUse = {
      session_id: "s1",
      cwd: raiz,
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_input: {},
    };

    const resultadoSinFallo = await ManagePreToolUse(inputHumanGate);

    const dirAquas = join(raiz, ".aquas");
    mkdirSync(dirAquas, { recursive: true });
    const destino = join(dirAquas, "payloads.jsonl");
    writeFileSync(destino, "");
    chmodSync(destino, 0o444);

    try {
      const resultadoConFallo = await ManagePreToolUse(inputHumanGate);
      assert.deepEqual(resultadoConFallo, resultadoSinFallo);
    } finally {
      chmodSync(destino, 0o644);
    }
  });
});

test("test 3: no registra valores de tool_input", async () => {
  await conProyectoTemporal((raiz) => {
    const centinela = "CENTINELA-UNICO-XYZ";
    registrarPayloadPreToolUse(inputBase(raiz, centinela));

    const jsonl = readFileSync(join(raiz, ".aquas", "payloads.jsonl"), "utf8");
    const linea = jsonl.trim().split("\n").pop()!;

    assert.equal(linea.includes(centinela), false);
  });
});

test("test 4: raiz ausente en el payload no crea directorios ni escribe", () => {
  const payload: Record<string, unknown> = {
    session_id: "s1",
    hook_event_name: "PreToolUse",
    tool_name: "Write",
    tool_input: {},
  };

  assert.doesNotThrow(() => registrarPayloadPreToolUse(payload));
});

test("test 5: raiz igual al literal undefined no crea directorios ni escribe", async () => {
  await conProyectoTemporal((raiz) => {
    const payload: Record<string, unknown> = {
      session_id: "s1",
      cwd: "undefined",
      hook_event_name: "PreToolUse",
      tool_name: "Write",
      tool_input: {},
    };

    registrarPayloadPreToolUse(payload);

    assert.equal(existsSync(join(raiz, ".aquas", "payloads.jsonl")), false);
    assert.equal(existsSync(join(process.cwd(), "undefined")), false);
  });
});

test("test 6: ManagePreToolUse con cwd no utilizable no cambia la decision", async () => {
  const inputHumanGate: PreToolUse = {
    session_id: "s1",
    cwd: "undefined",
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    tool_input: {},
  };

  const resultado = await ManagePreToolUse(inputHumanGate);

  assert.deepEqual(
    resultado,
    {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "Human Gate no puede usar Bash. Toda ejecución técnica se delega a orchestrator.",
      },
    },
  );

  assert.equal(existsSync(join(process.cwd(), "undefined")), false);
});
