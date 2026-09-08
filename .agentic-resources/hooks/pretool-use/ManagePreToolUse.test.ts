import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { PreToolUse } from "../../contracts/claude/PreToolUse.ts";
import { ManagePreToolUse } from "./ManagePreToolUse.ts";

const scratchBase = join(process.cwd(), ".scratch", "test-tmp");

async function conProyectoTemporal<T>(
  fn: (raiz: string) => Promise<T>,
): Promise<T> {
  mkdirSync(scratchBase, { recursive: true });
  const raiz = mkdtempSync(join(scratchBase, "manage-pretool-"));
  const original = process.env.CLAUDE_PROJECT_DIR;
  process.env.CLAUDE_PROJECT_DIR = raiz;
  try {
    return await fn(raiz);
  } finally {
    process.env.CLAUDE_PROJECT_DIR = original;
    rmSync(raiz, { recursive: true, force: true });
  }
}

function input(
  raiz: string,
  overrides: Record<string, unknown> = {},
): PreToolUse {
  return {
    session_id: "s1",
    cwd: raiz,
    hook_event_name: "PreToolUse",
    agent_id: "a1",
    tool_name: "Bash",
    tool_input: {},
    ...overrides,
  } as PreToolUse;
}

test("agent_type ausente no aplica el gate de worker", async () => {
  await conProyectoTemporal(async (raiz) => {
    const resultado = await ManagePreToolUse(
      input(raiz, {
        tool_name: "Bash",
        tool_input: { command: "cualquier-cosa" },
      }),
    );
    assert.equal(resultado, undefined);
  });
});

test("agent_type orchestrator conserva su comportamiento previo", async () => {
  await conProyectoTemporal(async (raiz) => {
    const resultado = await ManagePreToolUse(
      input(raiz, {
        agent_type: "orchestrator",
        tool_name: "Read",
        tool_input: { file_path: "x.ts" },
      }),
    );
    assert.equal(resultado, undefined);
  });
});
