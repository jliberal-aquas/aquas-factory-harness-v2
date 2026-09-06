import {readFile} from "node:fs/promises";
import {isAbsolute,relative,resolve} from "node:path";
import type {ZodType} from "zod";
import {InvalidPayloadError,parseJson} from "../../hooks/common/json.ts";
import {validatePayload} from "../../hooks/common/zod.ts";

function resolveInsideProject(
  projectRoot: string,
  relativePath: string,
): string {
  const absolutePath =
    resolve(
      projectRoot,
      relativePath,
    );

  const relation =
    relative(
      projectRoot,
      absolutePath,
    );

  if (
    relation.startsWith("..") ||
    isAbsolute(relation)
  ) {
    throw new InvalidPayloadError(
      `Ruta fuera del proyecto: ${relativePath}`,
    );
  }

  return absolutePath;
}


export async function readContract<T>(
  projectRoot: string,
  relativePath: string,
  schema: ZodType<T>,
  label: string,
): Promise<T> {

  const absolutePath =
    resolveInsideProject(
      projectRoot,
      relativePath,
    );

  let content: string;

  try {
    content =
      await readFile(
        absolutePath,
        "utf8",
      );
  } catch {
    throw new InvalidPayloadError(
      `${label} no encontrado: ${relativePath}`,
    );
  }

  const json =
    parseJson(
      content,
      label,
    );

  return validatePayload(
    schema,
    json,
    label,
  );
}