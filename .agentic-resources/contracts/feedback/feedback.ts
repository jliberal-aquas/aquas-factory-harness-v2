import { z } from "zod";

export const Feedback = z.object({
  estado: z.enum([
    "completada",
    "bloqueada"
  ]),

  resultados: z
    .array(z.string().min(1))
    .default([]),

  archivos_tocados: z
    .array(z.string().min(1))
    .default([]),

  bloqueos: z
    .array(z.string().min(1))
    .default([]),

  pendientes: z
    .array(z.string().min(1))
    .default([]),

  evidencias: z
    .array(z.string().min(1))
    .default([])
});

export type Feedback =
  z.infer<typeof Feedback>;