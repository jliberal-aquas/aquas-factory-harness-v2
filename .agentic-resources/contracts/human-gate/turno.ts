import { z } from "zod";
import { Procedencia } from "./procedencia.ts";
import { Alcance } from "./alcance.ts";
import { LIMITE_PRESUPUESTO_TURNOS } from "../limits/limites.ts";

// Contrato de ida: human gate -> orquestador. Unico canal entre los dos.
// Las decisiones del feature NO van aqui: viven en el spec.
export const Turno = z.object({
  turno_id: z.string().min(1),
  creada_en: z.iso.datetime(),
  procedencia: Procedencia,

  feature: z.string().min(1),
  spec: z.string().min(1),
  objetivo: z.string().min(1),

  alcance: Alcance,
  verificacion: z.string().min(1),
  presupuesto: z.object({
    turnos: z.number().int().positive().max(LIMITE_PRESUPUESTO_TURNOS)
  }),

  prohibido: z.array(z.string().min(1)).default([]),
  rutas_prohibidas: z.array(z.string().min(1)).default([])
});

export type Turno = z.infer<typeof Turno>;