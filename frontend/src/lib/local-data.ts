/** Every localStorage key this app writes. Used by export and "delete all local data". */
export const LOCAL_DATA_KEYS = [
  "aequa-theme",
  "aequa-preferences",
  "aequa-ui",
  "aequa-notifications",
  "aequa-saved",
  "aequa-mock-conversations",
  "aequa-mock-plans",
  "aequa-mock-uploads",
] as const;

export function exportLocalData(): string {
  const data: Record<string, unknown> = {};
  for (const key of LOCAL_DATA_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) data[key] = JSON.parse(raw);
    } catch {
      // skip unreadable entries
    }
  }
  return JSON.stringify({ exportedAt: new Date().toISOString(), note: "Sample data and preferences stored in this browser only.", data }, null, 2);
}

export function clearLocalData(): void {
  for (const key of LOCAL_DATA_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
