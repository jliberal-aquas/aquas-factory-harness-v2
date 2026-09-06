import type {
  MainStop,
} from "../../contracts/claude/AgentStop.ts";


export async function ManageHumanGateStop(
  _input: MainStop,
): Promise<unknown> {

  // Human Gate habla con el humano.
  // No tiene contrato de cierre agente-a-agente.
  //
  // Punto de extensión futuro para invariantes
  // deterministas del cierre del main.

  return undefined;
}