import { z } from "zod";

import {
  Procedencia,
} from "./procedencia.ts";

import {
  Alcance,
} from "./alcance.ts";

import {
  Ejecucion,
} from "../common/ejecucion.ts";

import {
  LIMITE_PRESUPUESTO_TURNOS,
} from "../limits/limites.ts";


// Contrato de ida:
// Human Gate -> Orchestrator.
//
// Las decisiones del feature NO viven aquí.
// Viven en el spec.
export const Turno = z.object({
  turno_id: z.string().min(1),

  creada_en: z.iso.datetime(),

  procedencia: Procedencia,

  feature: z.string().min(1),

  spec: z.string().min(1),

  objetivo: z.string().min(1),

  // Solo archivos/rutas.
  alcance: Alcance,

  // Autoridad máxima de ejecución del turno.
  ejecucion: Ejecucion,

  verificacion: z.string().min(1),

  presupuesto: z.object({
    turnos: z
      .number()
      .int()
      .positive()
      .max(
        LIMITE_PRESUPUESTO_TURNOS,
      ),
  }).strict(),

  prohibido: z
    .array(z.string().min(1))
    .default([]),

  rutas_prohibidas: z
    .array(z.string().min(1))
    .default([]),
}).strict();


export const BorradorTurno =
  Turno.omit({
    turno_id: true,
    creada_en: true,
    procedencia: true,
  }).strict();


export type Turno =
  z.infer<typeof Turno>;

export type BorradorTurno =
  z.infer<typeof BorradorTurno>;