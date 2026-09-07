import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { validateContractStop } from "./contract-stop.ts";

const Schema = z.object({ ok: z.literal(true) });
const scratchBase = join(process.cwd(), ".scratch", "test-tmp");

function conProyectoTemporal<T>(fn: (raiz: string) => T): T {
  mkdirSync(scratchBase, { recursive: true });
  const raiz = mkdtempSync(join(scratchBase, "contract-stop-"));
  const original = process.env.CLAUDE_PROJECT_DIR;
  process.env.CLAUDE_PROJECT_DIR = raiz;
  try {
    return fn(raiz);
  } finally {
    process.env.CLAUDE_PROJECT_DIR = original;
    rmSync(raiz, { recursive: true, force: true });
  }
}

test("rama A: stop_hook_active false y cierre invalido bloquea", () => {
  const resultado = validateContractStop("{bad json", Schema, "Entrega", false);
  assert.equal((resultado as { decision: string }).decision, "block");
  assert.ok((resultado as { reason: string }).reason.length > 0);
});

test("rama B: stop_hook_active true y cierre invalido registra agotamiento", () => {
  conProyectoTemporal((raiz) => {
    const resultado = validateContractStop("{bad json", Schema, "Entrega", true);
    assert.equal(resultado, undefined);

    const jsonl = readFileSync(join(raiz, ".aquas", "denegaciones.jsonl"), "utf8");
    const evento = JSON.parse(jsonl.trim().split("\n").pop()!);
    assert.equal(evento.agotado_reintento, true);
  });
});

test("rama C: cierre valido no bloquea ni registra, con stop_hook_active en ambos valores", () => {
  conProyectoTemporal((raiz) => {
    const mensaje = JSON.stringify({ ok: true });

    assert.equal(validateContractStop(mensaje, Schema, "Entrega", false), undefined);
    assert.equal(validateContractStop(mensaje, Schema, "Entrega", true), undefined);

    assert.throws(() => readFileSync(join(raiz, ".aquas", "denegaciones.jsonl")));
  });
});
