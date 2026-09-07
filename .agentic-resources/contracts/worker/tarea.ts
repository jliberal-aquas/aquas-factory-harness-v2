import { z } from "zod";

import {
  Alcance,
} from "../human-gate/alcance.ts";

import {
  Ejecucion,
} from "../common/ejecucion.ts";

import {
  WorkerId,
} from "./worker-id.ts";


export const Tarea = z.object({
  tarea_id: z.string().min(1),

  creada_en: z.iso.datetime(),

  turno_id: z.string().min(1),

  turno_ref: z.string().min(1),

  worker: WorkerId,

  objetivo: z.string().min(1),

  outcome_esperado:
    z.string().min(1),

  // Solo archivos/rutas.
  alcance: Alcance,

  // Comandos concretos de esta tarea.
  ejecucion: Ejecucion,

  criterios_terminado: z
    .array(z.string().min(1))
    .min(1),

  entradas: z
    .array(z.string().min(1))
    .default([]),

  prohibido: z
    .array(z.string().min(1))
    .default([]),

  rutas_prohibidas: z
    .array(z.string().min(1))
    .default([]),
}).strict();


export const BorradorTarea =
  Tarea.omit({
    tarea_id: true,
    creada_en: true,
    turno_id: true,
  }).strict();


export type Tarea =
  z.infer<typeof Tarea>;

export type BorradorTarea =
  z.infer<typeof BorradorTarea>;