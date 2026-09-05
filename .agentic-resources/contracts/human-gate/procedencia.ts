import { z } from "zod";

// Terna que identifica de donde viene un turno. No se inventa.
export const Procedencia = z.object({
  session_id: z.string().min(1),
  prompt_id: z.string().min(1),
  turno_id: z.string().min(1)
});

export type Procedencia = z.infer<typeof Procedencia>;