"use client";

import { MotionConfig } from "framer-motion";
import { SmoothScrollProvider } from "./smooth-scroll-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
