export function isRequestObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function readPositiveInteger(value: unknown): number | null {
  return isPositiveInteger(value) ? value : null;
}

export async function readRequestObject(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    return isRequestObject(value) ? value : null;
  } catch {
    return null;
  }
}
