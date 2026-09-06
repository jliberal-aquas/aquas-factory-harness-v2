export type ClaudeAgentDefinition = {
  source: string;
  target: string;

  frontmatter: {
    name: string;
    description: string;
    tools: string[];
    model: "opus" | "sonnet" | "haiku";
    maxTurns?: number;
  };
};

export const CLAUDE_CODE_AGENTS: ClaudeAgentDefinition[] = [
  {
    source: ".agentic-resources/agents/human-gate.md",
    target: ".claude/agents/human-gate.md",

    frontmatter: {
      name: "human-gate",
      description: "Puerta única entre el humano y el arnés.",
      tools: [
        "Agent(orchestrator)",
        "Read",
      ],
      model: "opus",
    },
  },

  {
    source: ".agentic-resources/agents/orchestrator.md",
    target: ".claude/agents/orchestrator.md",

    frontmatter: {
      name: "orchestrator",
      description:
        "Planifica un contrato de turno, lo divide en tareas medibles y coordina workers hasta producir el contrato de cierre.",

      tools: [
        "Read",
        "Glob",
        "Grep",
        "Agent",
      ],

      model: "sonnet",
      maxTurns: 60,
    },
  },
];