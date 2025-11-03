export function safeParse<T>(raw: string | null | undefined, defaultValue: T): T {
  if (!raw) return defaultValue;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function safeParseObject<T extends object>(raw: string | null | undefined, defaultValue: T): T {
  if (!raw) return defaultValue;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function safeParseArray<T = unknown>(raw: string | null | undefined, defaultValue: T[] = []): T[] {
  if (!raw) return defaultValue;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : defaultValue;
  } catch {
    return defaultValue;
  }
}
