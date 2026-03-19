export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function validateRequiredText(
  label: string,
  value: string,
  options?: { min?: number; max?: number },
): string | null {
  const normalized = normalizeText(value);
  const min = options?.min ?? 1;
  const max = options?.max ?? 200;

  if (normalized.length < min) return `${label} requis.`;
  if (normalized.length > max) return `${label} trop long (${max} caractères max).`;
  return null;
}

export function isDateRangeInvalid(startDate: Date | null, endDate: Date | null): boolean {
  if (!startDate || !endDate) return false;
  return endDate.getTime() < startDate.getTime();
}

