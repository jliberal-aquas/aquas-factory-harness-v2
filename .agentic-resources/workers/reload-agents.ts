import {
  compileClaudeCodeAgents,
} from "../adapters/claude-code/compile-agents.ts";

export type ReloadAgentsResult = {
  adapter: string;
  changed: string[];
  unchanged: string[];
};

export async function reloadAgents(
  args: string[],
): Promise<ReloadAgentsResult[]> {
  const claudeCode =
    args.includes("--claude-code");

  const all =
    args.includes("--all");

  if (!claudeCode && !all) {
    throw new Error(
      "Uso: reload-agents --claude-code | --all",
    );
  }

  const projectRoot =
    process.env.CLAUDE_PROJECT_DIR ??
    process.cwd();

  const results: ReloadAgentsResult[] = [];

  if (claudeCode || all) {
    const compiled =
      await compileClaudeCodeAgents(
        projectRoot,
      );

    results.push({
      adapter: "claude-code",

      changed: compiled
        .filter((x) => x.changed)
        .map((x) => x.name),

      unchanged: compiled
        .filter((x) => !x.changed)
        .map((x) => x.name),
    });
  }

  return results;
}