export function esRaizUtilizable(
  raiz: unknown,
): raiz is string {
  return (
    typeof raiz === "string" &&
    raiz.length > 0 &&
    raiz !== "undefined"
  );
}
