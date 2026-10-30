export interface DateGroup<T> {
  label: "Today" | "Yesterday" | "Previous 7 days" | "Previous 30 days" | "Older";
  items: T[];
}

const DAY = 86_400_000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Groups items (already sorted newest first) into conversation-style date buckets. */
export function groupByDate<T>(items: T[], getDate: (item: T) => string, now: Date): DateGroup<T>[] {
  const today = startOfDay(now);
  const buckets: DateGroup<T>[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Previous 30 days", items: [] },
    { label: "Older", items: [] },
  ];
  for (const item of items) {
    const age = (today - startOfDay(new Date(getDate(item)))) / DAY;
    const index = age <= 0 ? 0 : age <= 1 ? 1 : age <= 7 ? 2 : age <= 30 ? 3 : 4;
    buckets[index].items.push(item);
  }
  return buckets.filter((b) => b.items.length > 0);
}
