import { z } from "zod";
import { Feedback } from "../feedback/feedback.ts";

export const Entrega = Feedback.extend({
  tarea_id: z.string().min(1)
});

export type Entrega =
  z.infer<typeof Entrega>;