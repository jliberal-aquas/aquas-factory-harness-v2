import type {PreToolUse} from "../../contracts/claude/PreToolUse.ts";
import {PreToolUseAgent} from "../../contracts/claude/PreToolUseAgent.ts";
import {WorkerId} from "../../contracts/worker/worker-id.ts";
import {denyPreToolUse} from "../claude/responses.ts";
import {registrarPayloadPreToolUse} from "../observability/registrarPayloadPreToolUse.ts";
import {ManageHumanGatePretoolUse} from "./ManageHumanGatePretoolUse.ts";
import {ManageOrchestratorPretoolUse} from "./ManageOrchestratorPretoolUse.ts";
import {ManageWorkerPretoolUse} from "./ManageWorkerPretoolUse.ts";

function parseAgentCall(
  input: PreToolUse,
) {
  const result =
    PreToolUseAgent.safeParse(input);

  if (!result.success) {
    return {
      ok: false as const,

      output: denyPreToolUse(
        "Llamada Agent inválida.",
      ),
    };
  }

  return {
    ok: true as const,
    input: result.data,
  };
}


export async function ManagePreToolUse(
  input: PreToolUse,
): Promise<unknown> {
  registrarPayloadPreToolUse(input);

  // MAIN. agent_id solo existe en subagente.
  // En AQUAS, el main es Human Gate.
  if (input.agent_id === undefined) {

    // Human Gate necesita Agent para delegar
    // y Read para consumir referencias contractuales.
    if (input.tool_name === "Read") {
      return undefined;
    }

    if (input.tool_name !== "Agent") {
      return denyPreToolUse(
        `Human Gate no puede usar ${input.tool_name}. Toda ejecución técnica se delega a orchestrator.`,
      );
    }

    const agent =
      parseAgentCall(input);

    if (!agent.ok) {
      return agent.output;
    }

    return ManageHumanGatePretoolUse(
      agent.input,
    );
  }


  // ORCHESTRATOR. Su frontmatter restringe sus demás herramientas.
  // Aquí interceptamos únicamente su delegación contractual.
  if (
    input.agent_type === "orchestrator"
  ) {
    if (input.tool_name !== "Agent") {
      return undefined;
    }

    const agent =
      parseAgentCall(input);

    if (!agent.ok) {
      return agent.output;
    }

    return ManageOrchestratorPretoolUse(
      agent.input,
    );
  }


  // WORKERS. Ejecutan; no orquestan.
  // Sus otras capacidades quedan restringidas por su frontmatter.
  if (input.tool_name === "Agent") {
    return denyPreToolUse(
      "Un worker no puede delegar a otros agentes.",
    );
  }

  const worker =
    WorkerId.safeParse(input.agent_type);

  if (worker.success) {
    return ManageWorkerPretoolUse(input);
  }

  return undefined;
}