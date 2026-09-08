const SEGMENT_SPLIT = /&&|\|\||;|\|/;

export function isBashCommandAuthorized(
  command: string,
  comandosAutorizados: string[],
): boolean {
  const segments = command
    .split(SEGMENT_SPLIT)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) {
    return false;
  }

  return segments.every((segment) =>
    comandosAutorizados.some((autorizado) =>
      segment.startsWith(autorizado),
    ),
  );
}
