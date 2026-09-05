import { z } from "zod";

// Que archivos puede y debe tocar el turno. Mide archivos, no comportamiento.
// `permite` vacio significa que el turno no toca ningun archivo versionado.
export const Alcance = z.object({
  permite: z.array(z.string().min(1)),
  exige: z.array(z.string().min(1)).default([]),
  base: z.string().min(1).optional(),
  preexistentes: z.array(z.string().min(1)).default([])
});

export type Alcance = z.infer<typeof Alcance>;