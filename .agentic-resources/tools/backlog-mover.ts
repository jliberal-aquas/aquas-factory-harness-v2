import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type EstadoBacklog = "abiertos" | "en-curso" | "cerrados";

const ESTADOS: readonly EstadoBacklog[] = ["abiertos", "en-curso", "cerrados"];

function ubicarItem(raizBacklog: string, id: string): EstadoBacklog {
  for (const carpeta of ESTADOS) {
    if (existsSync(join(raizBacklog, carpeta, `${id}.json`))) return carpeta;
  }
  throw new Error(`id no encontrado en ninguna carpeta: ${id}`);
}

function validarEstado(estado: string): EstadoBacklog {
  if (!ESTADOS.includes(estado as EstadoBacklog)) {
    throw new Error(`--estado invalido: ${estado}. Permitidos: ${ESTADOS.join(", ")}`);
  }
  return estado as EstadoBacklog;
}

export function moverItemBacklog(
  raizBacklog: string,
  id: string,
  estado: string,
): string {
  const estadoDestino = validarEstado(estado);
  const origen = ubicarItem(raizBacklog, id);
  const rutaOrigen = join(raizBacklog, origen, `${id}.json`);
  const rutaDestino = join(raizBacklog, estadoDestino, `${id}.json`);

  if (rutaOrigen === rutaDestino) return rutaDestino;

  const contenido = readFileSync(rutaOrigen);
  mkdirSync(join(raizBacklog, estadoDestino), { recursive: true });
  writeFileSync(rutaDestino, contenido);
  unlinkSync(rutaOrigen);
  return rutaDestino;
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

function exigirValor(args: Record<string, string>, nombre: string): string {
  const valor = args[nombre];
  if (valor === undefined) throw new Error(`falta --${nombre}`);
  return valor;
}

function main(): void {
  try {
    const args = parseArgs(process.argv.slice(2));
    const id = exigirValor(args, "id");
    const estado = exigirValor(args, "estado");
    const raizBacklog = join(process.cwd(), ".aquas", "backlog");
    const rutaFinal = moverItemBacklog(raizBacklog, id, estado);
    process.stdout.write(`${rutaFinal}\n`);
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
