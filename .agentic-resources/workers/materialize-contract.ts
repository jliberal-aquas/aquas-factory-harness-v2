import {createHash} from "node:crypto";
import {mkdir,writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import type {ZodType} from "zod";
import {validatePayload} from "../hooks/common/zod.ts";

type MaterializeContractInput<T> = {
  schema: ZodType<T>;
  contract: unknown;

  projectRoot: string;
  relativePath: string;
};

export type MaterializedContract<T> = {
  contract: T;
  path: string;
  sha256: string;
};

export async function materializeContract<T>(
  input: MaterializeContractInput<T>,
): Promise<MaterializedContract<T>> {

  const contract =
    validatePayload(
      input.schema,
      input.contract,
      "Contrato",
    );

  const content =
    JSON.stringify(contract, null, 2) + "\n";

  const absolutePath =
    resolve(
      input.projectRoot,
      input.relativePath,
    );

  await mkdir(
    dirname(absolutePath),
    { recursive: true },
  );

  await writeFile(
    absolutePath,
    content,
    {
      encoding: "utf8",
      flag: "wx",
    },
  );

  const sha256 =
    createHash("sha256")
      .update(content)
      .digest("hex");

  return {
    contract,
    path:
      input.relativePath.replaceAll("\\", "/"),
    sha256,
  };
}