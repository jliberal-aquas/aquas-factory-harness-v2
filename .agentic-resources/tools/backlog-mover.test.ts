import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { moverItemBacklog } from "./backlog-mover.ts";

const rutaHerramienta = join(
  process.cwd(),
  ".agentic-resources",
  "tools",
  "backlog-mover.ts",
);

function conBacklogTemporal(fn: (raiz: string) => void): void {
  const base = join(process.cwd(), ".aquas", "backlog");
  mkdirSync(base, { recursive: true });
  const raiz = mkdtempSync(join(base, "test-"));
  try {
    fn(raiz);
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
}

const CONTENIDO_ITEM = '{\n  "id": "BKL-001",\n  "titulo": "x"\n}\n';

function sembrarItem(raiz: string, carpeta: string, id: string): void {
  const dir = join(raiz, carpeta);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${id}.json`), CONTENIDO_ITEM, "utf8");
}

test("mueve un item de abiertos a en-curso", () => {
  conBacklogTemporal((raiz) => {
    sembrarItem(raiz, "abiertos", "BKL-001");

    const rutaFinal = moverItemBacklog(raiz, "BKL-001", "en-curso");

    assert.equal(rutaFinal, join(raiz, "en-curso", "BKL-001.json"));
    assert.equal(
      readFileSync(join(raiz, "en-curso", "BKL-001.json"), "utf8"),
      CONTENIDO_ITEM,
    );
  });
});

test("mueve un item de en-curso a cerrados", () => {
  conBacklogTemporal((raiz) => {
    sembrarItem(raiz, "en-curso", "BKL-002");

    const rutaFinal = moverItemBacklog(raiz, "BKL-002", "cerrados");

    assert.equal(rutaFinal, join(raiz, "cerrados", "BKL-002.json"));
  });
});

test("id inexistente falla", () => {
  conBacklogTemporal((raiz) => {
    assert.throws(
      () => moverItemBacklog(raiz, "BKL-999", "en-curso"),
      /no encontrado/,
    );
  });
});

test("estado invalido falla", () => {
  conBacklogTemporal((raiz) => {
    sembrarItem(raiz, "abiertos", "BKL-003");

    assert.throws(
      () => moverItemBacklog(raiz, "BKL-003", "en-revision"),
      /invalido/,
    );
  });
});

test("el contenido del item queda intacto tras mover", () => {
  conBacklogTemporal((raiz) => {
    sembrarItem(raiz, "abiertos", "BKL-004");

    moverItemBacklog(raiz, "BKL-004", "cerrados");

    assert.equal(
      readFileSync(join(raiz, "cerrados", "BKL-004.json"), "utf8"),
      CONTENIDO_ITEM,
    );
  });
});

test("CLI: id inexistente falla con exit code distinto de cero", () => {
  const resultado = spawnSync(
    process.execPath,
    [rutaHerramienta, "--id", "BKL-999", "--estado", "en-curso"],
    { encoding: "utf8" },
  );

  assert.notEqual(resultado.status, 0);
  assert.match(resultado.stderr, /no encontrado/);
});

test("CLI: estado invalido falla con exit code distinto de cero", () => {
  const resultado = spawnSync(
    process.execPath,
    [rutaHerramienta, "--id", "BKL-005", "--estado", "invalido"],
    { encoding: "utf8" },
  );

  assert.notEqual(resultado.status, 0);
  assert.match(resultado.stderr, /invalido/);
});
