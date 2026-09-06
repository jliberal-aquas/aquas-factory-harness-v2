export async function leerStdin(): Promise<unknown> {
  let raw = "";

  for await (const chunk of process.stdin) {
    raw += chunk;
  }

  return JSON.parse(raw);
}