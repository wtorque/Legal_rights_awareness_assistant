"use client";

import { MotionConfig } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { usePreferencesStore } from "@/stores/preferences-store";
import { SmoothScrollProvider } from "./smooth-scroll-provider";
import { StoreHydrator } from "./store-hydrator";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePreferencesStore((s) => s.reducedMotion);
  return (
    <ThemeProvider>
      <StoreHydrator />
      <MotionConfig reducedMotion={reducedMotion === "on" ? "always" : "user"}>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </MotionConfig>
      <Toaster />
    </ThemeProvider>
  );
}
