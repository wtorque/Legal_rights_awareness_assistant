import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_COUNTRY, DEFAULT_REGION } from "@/config/jurisdictions";

export type ReducedMotionPref = "system" | "on" | "off";
export type DocumentRetention = "session" | "30d" | "90d" | "manual";
export type ConversationRetention = "keep" | "30d" | "off";

export interface Preferences {
  country: string;
  region: string | null;
  responseLanguage: string;
  interfaceLanguage: string;
  reducedMotion: ReducedMotionPref;
  /** Root font size as a percentage. */
  fontScale: number;
  documentRetention: DocumentRetention;
  conversationRetention: ConversationRetention;
  compactDensity: boolean;
  recentSearches: string[];
}

interface PreferencesState extends Preferences {
  set: (patch: Partial<Preferences>) => void;
  setCountry: (code: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  reset: () => void;
}

export const defaultPreferences: Preferences = {
  country: DEFAULT_COUNTRY,
  region: DEFAULT_REGION,
  responseLanguage: "en",
  interfaceLanguage: "en",
  reducedMotion: "system",
  fontScale: 100,
  documentRetention: "30d",
  conversationRetention: "keep",
  compactDensity: false,
  recentSearches: [],
};

/**
 * Non-sensitive UI preferences, stored only in this browser (localStorage).
 * skipHydration: the StoreHydrator rehydrates after mount so SSR markup matches.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      set: (patch) => set(patch),
      // A region belongs to one country; clear it when the country changes.
      setCountry: (code) => set({ country: code, region: null }),
      addRecentSearch: (query) =>
        set((s) => ({
          recentSearches: [query, ...s.recentSearches.filter((q) => q !== query)].slice(0, 6),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      reset: () => set({ ...defaultPreferences }),
    }),
    {
      name: "aequa-preferences",
      version: 1,
      skipHydration: true,
      partialize: (s): Preferences => ({
        country: s.country,
        region: s.region,
        responseLanguage: s.responseLanguage,
        interfaceLanguage: s.interfaceLanguage,
        reducedMotion: s.reducedMotion,
        fontScale: s.fontScale,
        documentRetention: s.documentRetention,
        conversationRetention: s.conversationRetention,
        compactDensity: s.compactDensity,
        recentSearches: s.recentSearches,
      }),
    },
  ),
);
