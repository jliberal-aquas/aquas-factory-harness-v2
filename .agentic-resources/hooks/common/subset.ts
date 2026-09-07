export function isStringSubset(
  child: string[],
  parent: string[],
): boolean {
  const allowed =
    new Set(parent);

  return child.every(
    (value) => allowed.has(value),
  );
}