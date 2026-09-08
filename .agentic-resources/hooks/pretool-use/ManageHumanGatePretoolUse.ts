import { randomUUID } from "node:crypto";
import type {PreToolUseAgent} from "../../contracts/claude/PreToolUseAgent.ts";
import {BorradorTurno, Turno} from "../../contracts/human-gate/turno.ts";
import {InvalidPayloadError} from "../common/json.ts";
import {manageContractDelegation} from "../claude/contract-delegation.ts";

export function ManageHumanGatePretoolUse(
  input: PreToolUseAgent,
): Promise<unknown> {

  return manageContractDelegation({
    input,

    label: "Turno",

    draftSchema: BorradorTurno,
    contractSchema: Turno,

    assertDelegation(current) {
      if (
        current.tool_input.subagent_type !==
        "orchestrator"
      ) {
        throw new InvalidPayloadError(
          "Human Gate solo puede delegar a orchestrator.",
        );
      }
    },

    buildContract(
      draft,
      context,
    ) {
      const turnoId =
        `T-${randomUUID()}`;
      return {
        ...draft,
        turno_id: turnoId,
        creada_en:
          new Date().toISOString(),
        procedencia: {
          session_id:
            context.sessionId,
          ...(context.promptId
            ? {prompt_id: context.promptId}
            : {}),
          turno_id:
            turnoId,
        },
      };
    },
    pathFor(turno) {
      return `.aquas/turnos/${turno.turno_id}.json`;
    },
  });
}