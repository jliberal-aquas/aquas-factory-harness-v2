import { z } from "zod";

// Terna que identifica de dónde viene un turno.
// No se inventa.
export const Procedencia = z.object({
  session_id: z.string().min(1),
  prompt_id: z.string().min(1).optional(),
  turno_id: z.string().min(1),
}).strict();

export type Procedencia =
  z.infer<typeof Procedencia>;