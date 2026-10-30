/** Recursively converts snake_case object keys to camelCase (wire → UI). Values are untouched. */
export function camelize<T>(value: unknown): T {
  if (Array.isArray(value)) return value.map((v) => camelize(v)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase()), camelize(v)]),
    ) as T;
  }
  return value as T;
}
