import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sampleNotifications } from "@/mocks/notifications";
import type { Notification } from "@/types/common";

interface NotificationState {
  items: Notification[];
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: sampleNotifications,
      readIds: [],
      markRead: (id) => set({ readIds: Array.from(new Set([...get().readIds, id])) }),
      markAllRead: () => set({ readIds: get().items.map((n) => n.id) }),
      clear: () => set({ items: [], readIds: [] }),
    }),
    {
      name: "aequa-notifications",
      version: 1,
      skipHydration: true,
      partialize: (s) => ({ items: s.items, readIds: s.readIds }),
    },
  ),
);
