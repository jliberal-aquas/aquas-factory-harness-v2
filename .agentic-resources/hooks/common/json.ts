export class InvalidPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPayloadError";
  }
}

export function parseJson(
  raw: string,
  label: string,
): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new InvalidPayloadError(
      `${label}: JSON inválido.`,
    );
  }
}