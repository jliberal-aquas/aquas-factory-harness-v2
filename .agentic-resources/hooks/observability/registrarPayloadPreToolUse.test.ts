import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { registrarPayloadPreToolUse } from "./registrarPayloadPreToolUse.ts";
import { ManagePreToolUse } from "../pretool-use/ManagePreToolUse.ts";
import type { PreToolUse } from "../../contracts/claude/PreToolUse.ts";

const scratchBase = join(process.cwd(), ".scratch", "test-tmp");

function conProyectoTemporal<T>(fn: (raiz: string) => T): T {
  mkdirSync(scratchBase, { recursive: true });
  const raiz = mkdtempSync(join(scratchBase, "payload-log-"));
  const original = process.env.CLAUDE_PROJECT_DIR;
  process.env.CLAUDE_PROJECT_DIR = raiz;
  try {
    return fn(raiz);
  } finally {
    process.env.CLAUDE_PROJECT_DIR = original;
    rmSync(raiz, { recursive: true, force: true });
  }
}

function inputBase(centinela: string): PreToolUse {
  return {
    session_id: "s1",
    cwd: process.cwd(),
    hook_event_name: "PreToolUse",
    agent_id: "a1",
    agent_type: "builder",
    tool_name: "Write",
    tool_input: { valor: centinela },
  };
}

test("test 1: registra linea con claves esperadas", () => {
  conProyectoTemporal((raiz) => {
    registrarPayloadPreToolUse(inputBase("secreto-1"));

    const jsonl = readFileSync(join(raiz, ".aquas", "payloads.jsonl"), "utf8");
    const evento = JSON.parse(jsonl.trim().split("\n").pop()!);

    assert.ok(typeof evento.creada_en === "string");
    assert.deepEqual(
      evento.claves,
      Object.keys(inputBase("secreto-1")).sort(),
    );
    assert.equal(evento.tool_name, "Write");
    assert.equal(evento.agent_type, "builder");
    assert.equal(evento.agent_id, "a1");
  });
});

test("test 2: fallo de escritura no altera la decision del hook", async () => {
  const inputHumanGate: PreToolUse = {
    session_id: "s1",
    cwd: process.cwd(),
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    tool_input: {},
  };

  const resultadoSinFallo = await ManagePreToolUse(inputHumanGate);

  mkdirSync(scratchBase, { recursive: true });
  const raiz = mkdtempSync(join(scratchBase, "payload-log-"));
  const original = process.env.CLAUDE_PROJECT_DIR;
  process.env.CLAUDE_PROJECT_DIR = raiz;

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
    process.env.CLAUDE_PROJECT_DIR = original;
    rmSync(raiz, { recursive: true, force: true });
  }
});

test("test 3: no registra valores de tool_input", () => {
  conProyectoTemporal((raiz) => {
    const centinela = "CENTINELA-UNICO-XYZ";
    registrarPayloadPreToolUse(inputBase(centinela));

    const jsonl = readFileSync(join(raiz, ".aquas", "payloads.jsonl"), "utf8");
    const linea = jsonl.trim().split("\n").pop()!;

    assert.equal(linea.includes(centinela), false);
  });
});
