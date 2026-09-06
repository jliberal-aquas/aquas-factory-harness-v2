import { leerStdin } from "../../.agentic-resources/hooks/common/stdin.ts";
import { AgentStop } from "../../.agentic-resources/contracts/claude/AgentStop.ts";
import { ManageAgentStop } from "../../.agentic-resources/hooks/agent-stop/ManageAgentStop.ts";

async function main(): Promise<void> {
  const input = AgentStop.parse(
    await leerStdin()
  );

  const output =
    await ManageAgentStop(input);

  if (output !== undefined) {
    process.stdout.write(
      JSON.stringify(output)
    );
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : String(error)
  );

  process.exit(2);
});