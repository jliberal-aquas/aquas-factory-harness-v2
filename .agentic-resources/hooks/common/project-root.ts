export function resolveProjectRoot(
  cwd: string,
): string {
  return (
    process.env.CLAUDE_PROJECT_DIR ??
    cwd
  );
}