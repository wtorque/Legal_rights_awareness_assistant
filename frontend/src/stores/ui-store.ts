import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  searchOpen: boolean;
  shortcutsOpen: boolean;
  /** Overrides for breadcrumb segments, keyed by full pathname (used by detail pages). */
  breadcrumbLabels: Record<string, string>;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setBreadcrumbLabel: (path: string, label: string | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      searchOpen: false,
      shortcutsOpen: false,
      breadcrumbLabels: {},
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
      setBreadcrumbLabel: (path, label) =>
        set((s) => {
          const next = { ...s.breadcrumbLabels };
          if (label) next[path] = label;
          else delete next[path];
          return { breadcrumbLabels: next };
        }),
    }),
    {
      name: "aequa-ui",
      version: 1,
      skipHydration: true,
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
);
