import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type TipoItem = "feature" | "bug" | "cambio" | "hallazgo";
export type PrioridadItem = "alta" | "media" | "baja";
export type OrigenItem = "humano" | "cierre-turno" | "deseable";

const TIPOS: readonly TipoItem[] = ["feature", "bug", "cambio", "hallazgo"];
const PRIORIDADES: readonly PrioridadItem[] = ["alta", "media", "baja"];
const ORIGENES: readonly OrigenItem[] = ["humano", "cierre-turno", "deseable"];
const CARPETAS = ["abiertos", "en-curso", "cerrados"] as const;

export interface ItemBacklogInput {
  tipo: TipoItem;
  titulo: string;
  prioridad: PrioridadItem;
  origen: OrigenItem;
  reqId?: string;
  specId?: string;
  apartadoViolado?: string;
  reproduccion?: string;
}

export interface ItemBacklog {
  id: string;
  tipo: TipoItem;
  titulo: string;
  origen: OrigenItem;
  prioridad: PrioridadItem;
  creada_en: string;
  req_id?: string;
  spec_id?: string;
  apartado_violado?: string;
  reproduccion?: string;
}

function siguienteId(raizBacklog: string): string {
  let maxN = 0;
  for (const carpeta of CARPETAS) {
    const dir = join(raizBacklog, carpeta);
    if (!existsSync(dir)) continue;
    for (const archivo of readdirSync(dir)) {
      const match = archivo.match(/^BKL-(\d{3})\.json$/);
      if (!match) continue;
      const n = Number(match[1]);
      if (n > maxN) maxN = n;
    }
  }
  return `BKL-${String(maxN + 1).padStart(3, "0")}`;
}

export function crearItemBacklog(
  raizBacklog: string,
  input: ItemBacklogInput,
): ItemBacklog {
  const id = siguienteId(raizBacklog);
  const item: ItemBacklog = {
    id,
    tipo: input.tipo,
    titulo: input.titulo,
    origen: input.origen,
    prioridad: input.prioridad,
    creada_en: new Date().toISOString(),
  };
  if (input.reqId !== undefined) item.req_id = input.reqId;
  if (input.specId !== undefined) item.spec_id = input.specId;
  if (input.apartadoViolado !== undefined) {
    item.apartado_violado = input.apartadoViolado;
  }
  if (input.reproduccion !== undefined) item.reproduccion = input.reproduccion;

  const dirAbiertos = join(raizBacklog, "abiertos");
  mkdirSync(dirAbiertos, { recursive: true });
  writeFileSync(
    join(dirAbiertos, `${id}.json`),
    JSON.stringify(item, null, 2) + "\n",
    "utf8",
  );
  return item;
}

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg?.startsWith("--")) continue;
    const clave = arg.slice(2);
    const valor = argv[i + 1];
    if (valor !== undefined) out[clave] = valor;
    i += 1;
  }
  return out;
}

function exigirValor(
  args: Record<string, string>,
  nombre: string,
): string {
  const valor = args[nombre];
  if (valor === undefined) throw new Error(`falta --${nombre}`);
  return valor;
}

function exigirEnum<T extends string>(
  args: Record<string, string>,
  nombre: string,
  permitidos: readonly T[],
): T {
  const valor = exigirValor(args, nombre);
  if (!permitidos.includes(valor as T)) {
    throw new Error(
      `--${nombre} invalido: ${valor}. Permitidos: ${permitidos.join(", ")}`,
    );
  }
  return valor as T;
}

function construirInput(args: Record<string, string>): ItemBacklogInput {
  const input: ItemBacklogInput = {
    tipo: exigirEnum(args, "tipo", TIPOS),
    titulo: exigirValor(args, "titulo"),
    prioridad: exigirEnum(args, "prioridad", PRIORIDADES),
    origen: exigirEnum(args, "origen", ORIGENES),
  };
  if (args.req !== undefined) input.reqId = args.req;
  if (args.spec !== undefined) input.specId = args.spec;
  if (args.apartado !== undefined) input.apartadoViolado = args.apartado;
  if (args.reproduccion !== undefined) input.reproduccion = args.reproduccion;
  return input;
}

function main(): void {
  try {
    const input = construirInput(parseArgs(process.argv.slice(2)));
    const raizBacklog = join(process.cwd(), ".aquas", "backlog");
    const item = crearItemBacklog(raizBacklog, input);
    process.stdout.write(`${item.id}\n`);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${mensaje}\n`);
    process.exitCode = 1;
  }
}

function rutaNormalizada(ruta: string): string {
  const absoluta = resolve(ruta);
  return process.platform === "win32" ? absoluta.toLowerCase() : absoluta;
}

const ejecutadoDirectamente =
  process.argv[1] !== undefined &&
  rutaNormalizada(fileURLToPath(import.meta.url)) ===
    rutaNormalizada(process.argv[1]);

if (ejecutadoDirectamente) {
  main();
}
