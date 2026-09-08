import {readFile} from "node:fs/promises";
import {basename, dirname, join} from "node:path";
import type {PreToolUse} from "../../contracts/claude/PreToolUse.ts";
import {Tarea} from "../../contracts/worker/tarea.ts";
import {InvalidPayloadError, parseJson} from "../common/json.ts";
import {readContract} from "../../workers/contracts/read-contract.ts";
import {resolveProjectRoot} from "../common/project-root.ts";
import {
  readTareaPathCache,
  writeTareaPathCache,
} from "./tarea-path-cache.ts";

type SubagentTranscriptLine = {
  type?: string;
  parentUuid?: string | null;
  message?: {content?: unknown};
};

function firstTextBlock(
  content: unknown,
): string | undefined {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    for (const block of content) {
      const candidate = block as {
        type?: unknown;
        text?: unknown;
      };

      if (
        candidate?.type === "text" &&
        typeof candidate.text === "string"
      ) {
        return candidate.text;
      }
    }
  }

  return undefined;
}

function resolveTranscriptPath(
  transcriptPath: string,
  sessionId: string,
  agentId: string,
): string {
  const expectedBasename =
    `agent-${agentId}.jsonl`;

  if (
    basename(transcriptPath) ===
    expectedBasename
  ) {
    return transcriptPath;
  }

  return join(
    dirname(transcriptPath),
    sessionId,
    "subagents",
    expectedBasename,
  );
}

async function readFirstUserLine(
  transcriptPath: string,
): Promise<SubagentTranscriptLine> {
  let content: string;

  try {
    content = await readFile(
      transcriptPath,
      "utf8",
    );
  } catch {
    throw new InvalidPayloadError(
      `Transcript de subagente no encontrado: ${transcriptPath}`,
    );
  }

  const firstLine = content
    .split("\n")
    .find((line) => line.trim().length > 0);

  if (firstLine === undefined) {
    throw new InvalidPayloadError(
      "Transcript de subagente vacío.",
    );
  }

  const parsed = parseJson(
    firstLine,
    "Línea de transcript",
  ) as SubagentTranscriptLine;

  if (
    parsed.type !== "user" ||
    parsed.parentUuid !== null
  ) {
    throw new InvalidPayloadError(
      "Primera línea de transcript no es el prompt inicial del subagente.",
    );
  }

  return parsed;
}

export async function resolveWorkerTarea(
  input: PreToolUse,
): Promise<Tarea> {
  const raw =
    input as Record<string, unknown>;

  const agentId = input.agent_id;
  const sessionId = input.session_id;
  const transcriptPath = raw.transcript_path;

  if (
    typeof agentId !== "string" ||
    typeof sessionId !== "string" ||
    typeof transcriptPath !== "string"
  ) {
    throw new InvalidPayloadError(
      "Payload de PreToolUse sin agent_id, session_id o transcript_path.",
    );
  }

  const projectRoot =
    resolveProjectRoot(input.cwd);

  const cachedPath =
    await readTareaPathCache(
      projectRoot,
      agentId,
    );

  if (cachedPath !== undefined) {
    return readContract(
      projectRoot,
      cachedPath,
      Tarea,
      "Tarea",
    );
  }

  const candidatePath =
    resolveTranscriptPath(
      transcriptPath,
      sessionId,
      agentId,
    );

  const line =
    await readFirstUserLine(
      candidatePath,
    );

  const contractPath =
    firstTextBlock(line.message?.content);

  if (
    contractPath === undefined ||
    contractPath.trim().length === 0
  ) {
    throw new InvalidPayloadError(
      "Transcript de subagente sin ruta de contrato en el prompt inicial.",
    );
  }

  const tarea =
    await readContract(
      projectRoot,
      contractPath,
      Tarea,
      "Tarea",
    );

  await writeTareaPathCache(
    projectRoot,
    agentId,
    contractPath,
  );

  return tarea;
}
