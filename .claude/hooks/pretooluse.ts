import {leerStdin} from "../../.agentic-resources/hooks/common/stdin.ts";
import {PreToolUse} from "../../.agentic-resources/contracts/claude/PreToolUse.ts";
import {ManagePreToolUse} from "../../.agentic-resources/hooks/pretool-use/ManagePreToolUse.ts"  


async function main(): Promise<void> {
  const input =
    PreToolUse.parse(
      await leerStdin(),
    );

  const output =
    await ManagePreToolUse(input);

  if (output !== undefined) {
    process.stdout.write(
      JSON.stringify(output),
    );
  }
}


main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  );

  /*
   * PreToolUse policy gate:
   * fallo interno = bloquear.
   */
  process.exit(2);
});