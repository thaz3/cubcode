/** Normalize RSC-serialized dates (string) back to Date on the client. */
export function coerceDate(
  value: Date | string | null | undefined,
): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toIsoString(
  value: Date | string | null | undefined,
): string | null {
  const date = coerceDate(value);
  return date ? date.toISOString() : null;
}
