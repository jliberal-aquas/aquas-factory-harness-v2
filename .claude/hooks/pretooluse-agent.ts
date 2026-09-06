import { ManageHumanGatePretoolUse } from "../../.agentic-resources/hooks/pretool-use/ManageHumanGatePretoolUse.ts";
import { ManageOrchestratorPretoolUse } from "../../.agentic-resources/hooks/pretool-use/ManageOrchestratorPretoolUse.ts";
import { leerStdin } from "../../.agentic-resources/hooks/common/stdin.ts";
import { PreToolUseAgent } from "../../.agentic-resources/contracts/claude/PreToolUseAgent.ts";

async function main(): Promise<void> {
  const input = PreToolUseAgent.parse(
    await leerStdin()
  );

  const handlers = {
    "human-gate": ManageHumanGatePretoolUse,
    "orchestrator": ManageOrchestratorPretoolUse,
  } as const;

  const handler =
    handlers[input.agent_type as keyof typeof handlers];

  if (!handler) {
    return;
  }

  const output = await handler(input);

  if (output !== undefined) {
    process.stdout.write(
      JSON.stringify(output)
    ); 
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});