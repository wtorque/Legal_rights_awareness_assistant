"use client";

import { useEffect } from "react";
import { useSavedStore } from "@/stores/saved-store";
import { useNotificationStore } from "@/stores/notification-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useUiStore } from "@/stores/ui-store";

/**
 * Rehydrates persisted stores after mount (so server and first client render agree)
 * and mirrors display preferences onto <html>.
 */
export function StoreHydrator() {
  useEffect(() => {
    void usePreferencesStore.persist.rehydrate();
    void useUiStore.persist.rehydrate();
    void useNotificationStore.persist.rehydrate();
    void useSavedStore.persist.rehydrate();

    const applyDisplay = (s: ReturnType<typeof usePreferencesStore.getState>) => {
      const root = document.documentElement;
      root.style.fontSize = `${s.fontScale}%`;
      const systemReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const reduced = s.reducedMotion === "on" || (s.reducedMotion === "system" && systemReduced);
      root.dataset.reducedMotion = String(reduced);
      root.dataset.density = s.compactDensity ? "compact" : "comfortable";
    };
    applyDisplay(usePreferencesStore.getState());
    return usePreferencesStore.subscribe(applyDisplay);
  }, []);

  return null;
}
