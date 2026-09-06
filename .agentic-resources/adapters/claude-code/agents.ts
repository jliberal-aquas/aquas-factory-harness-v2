export type ClaudeAgentDefinition = {
  sources: string[];
  target: string;

  frontmatter: {
    name: string;
    description: string;
    tools: string[];
    model: "opus" | "sonnet" | "haiku";
    maxTurns?: number;
  };
};

const WORKER_BASE =
  ".agentic-resources/agents/workers/worker.md";

export const CLAUDE_CODE_AGENTS: ClaudeAgentDefinition[] = [
  {
    sources: [
      ".agentic-resources/agents/human-gate.md",
    ],

    target:
      ".claude/agents/human-gate.md",

    frontmatter: {
      name: "human-gate",
      description:
        "Puerta única entre el humano y el arnés.",
      tools: [
        "Agent(orchestrator)",
        "Read",
      ],
      model: "opus",
    },
  },

  {
    sources: [
      ".agentic-resources/agents/orchestrator.md",
    ],

    target:
      ".claude/agents/orchestrator.md",

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

  {
    sources: [
      WORKER_BASE,
      ".agentic-resources/agents/workers/researcher.md",
    ],

    target:
      ".claude/agents/researcher.md",

    frontmatter: {
      name: "researcher",
      description:
        "Investiga una tarea y devuelve evidencia técnica sin modificar estado.",
      tools: [
        "Read",
        "Glob",
        "Grep",
      ],
      model: "haiku",
    },
  },

  {
    sources: [
      WORKER_BASE,
      ".agentic-resources/agents/workers/builder.md",
    ],

    target:
      ".claude/agents/builder.md",

    frontmatter: {
      name: "builder",
      description:
        "Implementa un outcome contractual dentro del alcance autorizado.",
      tools: [
        "Read",
        "Glob",
        "Grep",
        "Edit",
        "Write",
        "Bash",
      ],
      model: "sonnet",
    },
  },

  {
    sources: [
      WORKER_BASE,
      ".agentic-resources/agents/workers/verifier.md",
    ],

    target:
      ".claude/agents/verifier.md",

    frontmatter: {
      name: "verifier",
      description:
        "Verifica independientemente un outcome sin modificarlo.",
      tools: [
        "Read",
        "Glob",
        "Grep",
        "Bash",
      ],
      model: "haiku",
    },
  },

  {
    sources: [
      WORKER_BASE,
      ".agentic-resources/agents/workers/recorder.md",
    ],

    target:
      ".claude/agents/recorder.md",

    frontmatter: {
      name: "recorder",
      description:
        "Actualiza estado documental y operacional autorizado de la fábrica.",
      tools: [
        "Read",
        "Glob",
        "Grep",
        "Edit",
        "Write",
      ],
      model: "haiku",
    },
  },

  {
    sources: [
      WORKER_BASE,
      ".agentic-resources/agents/workers/committer.md",
    ],

    target:
      ".claude/agents/committer.md",

    frontmatter: {
      name: "committer",
      description:
        "Crea el commit autorizado de un turno ya verificado.",
      tools: [
        "Read",
        "Glob",
        "Grep",
        "Bash",
      ],
      model: "haiku",
    },
  },
];