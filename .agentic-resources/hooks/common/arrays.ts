export function mergeUniqueStrings(
  ...groups: string[][]
): string[] {
  return [
    ...new Set(
      groups.flat(),
    ),
  ];
}