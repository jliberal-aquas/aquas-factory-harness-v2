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
import { crearItemBacklog } from "./backlog-anotar.ts";

const rutaHerramienta = join(
  process.cwd(),
  ".agentic-resources",
  "tools",
  "backlog-anotar.ts",
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

test("crea item con obligatorios", () => {
  conBacklogTemporal((raiz) => {
    const item = crearItemBacklog(raiz, {
      tipo: "feature",
      titulo: "titulo de prueba",
      prioridad: "alta",
      origen: "humano",
    });

    assert.equal(item.id, "BKL-001");
    const contenido = JSON.parse(
      readFileSync(join(raiz, "abiertos", `${item.id}.json`), "utf8"),
    );
    assert.equal(contenido.tipo, "feature");
    assert.equal(contenido.titulo, "titulo de prueba");
    assert.equal(contenido.prioridad, "alta");
    assert.equal(contenido.origen, "humano");
    assert.equal(contenido.estado, undefined);
    assert.match(
      contenido.creada_en,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
  });
});

test("correlativo avanza sin colisionar con items en abiertos, en-curso y cerrados", () => {
  conBacklogTemporal((raiz) => {
    for (const [carpeta, n] of [
      ["abiertos", "005"],
      ["en-curso", "010"],
      ["cerrados", "003"],
    ] as const) {
      const dir = join(raiz, carpeta);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, `BKL-${n}.json`), "{}", "utf8");
    }

    const item = crearItemBacklog(raiz, {
      tipo: "bug",
      titulo: "otro item",
      prioridad: "baja",
      origen: "deseable",
    });

    assert.equal(item.id, "BKL-011");
  });
});

test("opcional ausente se omite del JSON, nunca se emite null", () => {
  conBacklogTemporal((raiz) => {
    const item = crearItemBacklog(raiz, {
      tipo: "cambio",
      titulo: "sin opcionales",
      prioridad: "media",
      origen: "cierre-turno",
    });

    const contenido = JSON.parse(
      readFileSync(join(raiz, "abiertos", `${item.id}.json`), "utf8"),
    );
    assert.equal("req_id" in contenido, false);
    assert.equal("spec_id" in contenido, false);
    assert.equal("apartado_violado" in contenido, false);
    assert.equal("reproduccion" in contenido, false);
  });
});

test("CLI: tipo invalido falla con exit code distinto de cero", () => {
  const resultado = spawnSync(
    process.execPath,
    [
      rutaHerramienta,
      "--tipo",
      "invalido",
      "--titulo",
      "x",
      "--prioridad",
      "alta",
      "--origen",
      "humano",
    ],
    { encoding: "utf8" },
  );

  assert.notEqual(resultado.status, 0);
  assert.match(resultado.stderr, /tipo/);
});

test("CLI: prioridad invalida falla con exit code distinto de cero", () => {
  const resultado = spawnSync(
    process.execPath,
    [
      rutaHerramienta,
      "--tipo",
      "feature",
      "--titulo",
      "x",
      "--prioridad",
      "invalida",
      "--origen",
      "humano",
    ],
    { encoding: "utf8" },
  );

  assert.notEqual(resultado.status, 0);
  assert.match(resultado.stderr, /prioridad/);
});
