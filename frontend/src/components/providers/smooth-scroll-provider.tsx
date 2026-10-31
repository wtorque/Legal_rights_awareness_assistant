"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferences-store";

/**
 * Slow, eased page scrolling (ADR-026). Skipped when the person prefers reduced motion, either in Settings or in the
 * operating system, so scrolling stays native for them. Nested scroll areas (document viewer, dialogs, chat list)
 * keep scrolling on their own.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePreferencesStore((s) => s.reducedMotion);

  useEffect(() => {
    const systemReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion === "on" || (reducedMotion === "system" && systemReduced)) return;

    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.85, smoothWheel: true, allowNestedScroll: true });
    let frame = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
