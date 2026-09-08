import {mkdir, readFile, writeFile} from "node:fs/promises";
import {join} from "node:path";

const SAFE_AGENT_ID = /^[A-Za-z0-9_-]+$/;

function cacheDir(
  projectRoot: string,
): string {
  return join(
    projectRoot,
    ".aquas",
    "agentes",
  );
}

function cacheFilePath(
  projectRoot: string,
  agentId: string,
): string | undefined {
  if (!SAFE_AGENT_ID.test(agentId)) {
    return undefined;
  }

  return join(
    cacheDir(projectRoot),
    `${agentId}.json`,
  );
}

export async function readTareaPathCache(
  projectRoot: string,
  agentId: string,
): Promise<string | undefined> {
  const filePath =
    cacheFilePath(projectRoot, agentId);

  if (filePath === undefined) {
    return undefined;
  }

  let raw: string;

  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }

  try {
    const parsed =
      JSON.parse(raw) as {tareaPath?: unknown};

    return typeof parsed.tareaPath === "string" ?
      parsed.tareaPath :
      undefined;
  } catch {
    return undefined;
  }
}

export async function writeTareaPathCache(
  projectRoot: string,
  agentId: string,
  tareaPath: string,
): Promise<void> {
  const filePath =
    cacheFilePath(projectRoot, agentId);

  if (filePath === undefined) {
    return;
  }

  try {
    await mkdir(
      cacheDir(projectRoot),
      {recursive: true},
    );
    await writeFile(
      filePath,
      JSON.stringify({tareaPath}),
      "utf8",
    );
  } catch {
    return;
  }
}
