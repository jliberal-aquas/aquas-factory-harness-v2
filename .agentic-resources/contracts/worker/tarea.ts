import { z } from "zod";
import {Alcance} from "../human-gate/alcance.ts";
import {WorkerId} from "./worker-id.ts";

export const Tarea = z.object({
  //Identidad materializada por el arnés.
  tarea_id: z.string().min(1),
  creada_en: z.iso.datetime(),
  //Linaje. turno_ref viene del Orchestrator. turno_id lo deriva el arnés leyendo ese Turno.
  turno_id: z.string().min(1),
  turno_ref: z.string().min(1),
  //Quién debe ejecutar.
  worker: WorkerId,
  //Qué debe quedar cierto
  objetivo: z.string().min(1),
  outcome_esperado: z.string().min(1),
  //Qué puede/debe tocar.
  alcance: Alcance,
  //Qué demuestra que terminó.
  criterios_terminado: z.array(z.string().min(1)).min(1),
  //Referencias adicionales necesarias:
  //spec, evidencia, entregas previas, etc. Referencias, no contexto narrativo.
  entradas: z.array(z.string().min(1)).default([]),
  //Restricciones heredadas del Turno.
  prohibido: z.array(z.string().min(1)).default([]),
  rutas_prohibidas: z.array(z.string().min(1)).default([]),
});

export type Tarea = z.infer<typeof Tarea>;

export const BorradorTarea = Tarea.omit({
  tarea_id: true,
  creada_en: true,
  turno_id: true,
});

export type BorradorTarea = z.infer<typeof BorradorTarea>;