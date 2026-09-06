import { z } from "zod";
import { Feedback } from "../feedback/feedback.ts";

export const VerificacionTurno = z.object({
  estado: z.enum([
    "paso",
    "fallo",
    "no_ejecutada"
  ]),

  evidencia: z
    .string()
    .min(1)
    .optional()
});

export const CierreTurno =
  Feedback.extend({
    turno_id: z.string().min(1),

    verificacion: VerificacionTurno,

    entregas: z
      .array(z.string().min(1))
      .default([])
  });

export type CierreTurno =
  z.infer<typeof CierreTurno>;