import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";

import {
  dirname,
  resolve,
} from "node:path";

import {
  CLAUDE_CODE_AGENTS,
  type ClaudeAgentDefinition,
} from "./agents.ts";

export type CompiledAgent = {
  name: string;
  source: string;
  target: string;
  changed: boolean;
};

function renderFrontmatter(
  definition: ClaudeAgentDefinition,
): string {
  const fm = definition.frontmatter;

  const lines = [
    "---",
    `name: ${fm.name}`,
    `description: ${JSON.stringify(fm.description)}`,
    `tools: ${fm.tools.join(", ")}`,
    `model: ${fm.model}`,
  ];

  if (fm.maxTurns !== undefined) {
    lines.push(`maxTurns: ${fm.maxTurns}`);
  }

  lines.push("---");

  return lines.join("\n");
}

async function readIfExists(
  path: string,
): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}

async function compileAgent(
  projectRoot: string,
  definition: ClaudeAgentDefinition,
): Promise<CompiledAgent> {
  const sourcePath = resolve(
    projectRoot,
    definition.source,
  );

  const targetPath = resolve(
    projectRoot,
    definition.target,
  );

  const behavior = (
    await readFile(sourcePath, "utf8")
  ).trim();

  if (behavior.startsWith("---")) {
    throw new Error(
      `${definition.source}: behavior canónico no debe contener frontmatter`,
    );
  }

  const generated =
    `${renderFrontmatter(definition)}\n\n` +
    `${behavior}\n`;

  const current = await readIfExists(
    targetPath,
  );

  if (current === generated) {
    return {
      name: definition.frontmatter.name,
      source: definition.source,
      target: definition.target,
      changed: false,
    };
  }

  await mkdir(dirname(targetPath), {
    recursive: true,
  });

  await writeFile(
    targetPath,
    generated,
    "utf8",
  );

  return {
    name: definition.frontmatter.name,
    source: definition.source,
    target: definition.target,
    changed: true,
  };
}

export async function compileClaudeCodeAgents(
  projectRoot: string,
): Promise<CompiledAgent[]> {
  const result: CompiledAgent[] = [];

  for (const definition of CLAUDE_CODE_AGENTS) {
    result.push(
      await compileAgent(
        projectRoot,
        definition,
      ),
    );
  }

  return result;
}