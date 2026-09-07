import { z } from "zod";

/**
 * Comandos autorizados por el contrato.
 *
 * [] = ningún comando autorizado.
 *
 * En Turno:
 *   define el techo de ejecución permitido.
 *
 * En Tarea:
 *   define los comandos concretos que necesita el worker.
 *
 * Tarea.ejecucion.comandos debe ser subconjunto de
 * Turno.ejecucion.comandos.
 */
export const Ejecucion = z.object({
  comandos: z
    .array(z.string().min(1))
    .default([]),
}).strict();

export type Ejecucion =
  z.infer<typeof Ejecucion>;