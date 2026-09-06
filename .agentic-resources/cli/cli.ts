import {
  reloadAgents,
} from "../workers/reload-agents.ts";

async function main(): Promise<void> {
  const [
    command,
    ...args
  ] = process.argv.slice(2);

  switch (command) {
    case "reload-agents": {
      const results =
        await reloadAgents(args);

      for (const result of results) {
        const changed =
          result.changed.length > 0
            ? result.changed.join(",")
            : "-";

        const unchanged =
          result.unchanged.length > 0
            ? result.unchanged.join(",")
            : "-";

        process.stdout.write(
          [
            "OK",
            `adapter=${result.adapter}`,
            `changed=${changed}`,
            `unchanged=${unchanged}`,
          ].join(" ") + "\n",
        );
      }

      return;
    }

    default:
      throw new Error(
        `Comando desconocido: ${command ?? "<vacío>"}`,
      );
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  );

  process.exit(1);
});