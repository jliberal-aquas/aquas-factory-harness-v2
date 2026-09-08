import {isAbsolute, relative, resolve} from "node:path";

function toProjectRelative(
  projectRoot: string,
  targetPath: string,
): string {
  const absolute =
    isAbsolute(targetPath) ?
      targetPath :
      resolve(projectRoot, targetPath);

  return relative(
    projectRoot,
    absolute,
  ).split("\\").join("/");
}

export function isWritePathForbidden(
  projectRoot: string,
  targetPath: string,
  rutasProhibidas: string[],
): boolean {
  const relativePath =
    toProjectRelative(
      projectRoot,
      targetPath,
    );

  return rutasProhibidas.some(
    (prohibida) =>
      relativePath.startsWith(prohibida),
  );
}
