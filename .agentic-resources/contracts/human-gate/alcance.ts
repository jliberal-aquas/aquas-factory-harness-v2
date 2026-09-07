import { z } from "zod";

// Qué archivos puede y debe tocar el turno.
// Mide archivos, no comportamiento.
//
// `permite` vacío significa que el turno
// no toca ningún archivo versionado.
export const Alcance = z.object({
  permite: z
    .array(z.string().min(1)),

  exige: z
    .array(z.string().min(1))
    .default([]),

  base: z
    .string()
    .min(1)
    .optional(),

  preexistentes: z
    .array(z.string().min(1))
    .default([]),
}).strict();

export type Alcance = z.infer<typeof Alcance>;