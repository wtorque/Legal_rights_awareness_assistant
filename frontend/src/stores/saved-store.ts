import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedKind = "topic" | "source" | "plan" | "legal-aid";

export interface SavedItem {
  key: string;
  kind: SavedKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  savedAt: string;
}

interface SavedState {
  items: SavedItem[];
  recentTopics: string[];
  toggle: (item: Omit<SavedItem, "key" | "savedAt">) => boolean;
  remove: (key: string) => void;
  isSaved: (kind: SavedKind, id: string) => boolean;
  visitTopic: (slug: string) => void;
}

export const savedKey = (kind: SavedKind, id: string) => `${kind}:${id}`;

/** Bookmarks and recently viewed topics, kept in this browser only. */
export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      items: [],
      recentTopics: [],
      toggle: (item) => {
        const key = savedKey(item.kind, item.id);
        const exists = get().items.some((i) => i.key === key);
        set((s) => ({
          items: exists ? s.items.filter((i) => i.key !== key) : [{ ...item, key, savedAt: new Date().toISOString() }, ...s.items],
        }));
        return !exists;
      },
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      isSaved: (kind, id) => get().items.some((i) => i.key === savedKey(kind, id)),
      visitTopic: (slug) => set((s) => ({ recentTopics: [slug, ...s.recentTopics.filter((x) => x !== slug)].slice(0, 5) })),
    }),
    {
      name: "aequa-saved",
      version: 1,
      skipHydration: true,
      partialize: (s) => ({ items: s.items, recentTopics: s.recentTopics }),
    },
  ),
);
