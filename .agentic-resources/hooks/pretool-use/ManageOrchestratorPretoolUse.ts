import {randomUUID} from "node:crypto";
import type {PreToolUseAgent} from "../../contracts/claude/PreToolUseAgent.ts";
import {Turno} from "../../contracts/human-gate/turno.ts";
import {BorradorTarea,Tarea} from "../../contracts/worker/tarea.ts";
import {WorkerId} from "../../contracts/worker/worker-id.ts";
import {InvalidPayloadError} from "../common/json.ts";
import {mergeUniqueStrings} from "../common/arrays.ts";
import {manageContractDelegation} from "../claude/contract-delegation.ts";
import {readContract} from "../../workers/contracts/read-contract.ts";
import { isStringSubset } from "../common/subset.ts";

export function ManageOrchestratorPretoolUse(input: PreToolUseAgent): Promise<unknown> {

  return manageContractDelegation({
    input,
    label: "Tarea",
    draftSchema: BorradorTarea,
    contractSchema: Tarea,
    //Política de ejecución antes incluso de aceptar el payload.
    assertDelegation(current) {
      const target =
        current.tool_input.subagent_type;

      const worker =
        WorkerId.safeParse(
          target,
        );

      if (!worker.success) {
        throw new InvalidPayloadError(
          `Worker no permitido: ${target}`,
        );
      }

      const model =
        current.tool_input.model;
      //Sin model explícito:   
      // usa el definido en frontmatter del worker. Si Orchestrator lo fuerza, solo
      // Haiku o Sonnet son válidos.
      if (
        model !== undefined &&
        model !== "haiku" &&
        model !== "sonnet"
      ) {
        throw new InvalidPayloadError(
          `Modelo no permitido para worker: ${model}`,
        );
      }
    },

    async buildContract(draft,context) {
      /*
       * El worker declarado en el contrato
       * debe ser exactamente el Agent
       * que Claude intentó lanzar.
       */
      if (draft.worker !== input.tool_input.subagent_type) {
        throw new InvalidPayloadError(
          `Tarea.worker (${draft.worker}) no coincide con Agent.subagent_type (${input.tool_input.subagent_type}).`,
        );
      }
      /*
       * El Orchestrator proporciona turno_ref.
       * El arnés obtiene turno_id desde el
       * contrato real; el modelo no lo inventa.
       */
      const turno = await readContract(context.projectRoot,draft.turno_ref,Turno,"Turno padre");

      if (!isStringSubset(draft.ejecucion.comandos,turno.ejecucion.comandos)) {
        throw new InvalidPayloadError(
          "Tarea intenta ejecutar comandos no autorizados por el Turno.",
        );
      }   
      //Si el Turno fija una base, una Tarea no puede cambiarla.
      if (turno.alcance.base !== undefined &&
        draft.alcance.base !== undefined &&
        draft.alcance.base !== turno.alcance.base) {
        throw new InvalidPayloadError(
          "Tarea no puede cambiar alcance.base del Turno.",
        );
      }

      const tareaId = `TA-${randomUUID()}`;
      return {
        ...draft,
        //Metadata controlada por el arnés.
        tarea_id: tareaId,
        creada_en: new Date().toISOString(),
        turno_id: turno.turno_id,
        //Una tarea puede ser más restrictiva, nunca perder prohibiciones heredadas.
        prohibido: mergeUniqueStrings(turno.prohibido,draft.prohibido),
        rutas_prohibidas: mergeUniqueStrings(turno.rutas_prohibidas,draft.rutas_prohibidas),
        //Si la Tarea no declara base, hereda la del Turno.
        alcance: {
          ...draft.alcance,
          base:
            draft.alcance.base ??
            turno.alcance.base,
        },
      };
    },

    pathFor(tarea) {
      return (
        `.aquas/tareas/` +
        `${tarea.turno_id}/` +
        `${tarea.tarea_id}.json`
      );
    },
  });
}