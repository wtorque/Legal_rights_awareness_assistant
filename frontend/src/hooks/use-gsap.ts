"use client";

import { type RefObject, useEffect } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Run GSAP code scoped to a container; everything created inside is reverted on unmount.
 * Skipped when the user prefers reduced motion (system or Settings override).
 */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: () => void, deps: React.DependencyList = []) {
  useEffect(() => {
    const forced = document.documentElement.dataset.reducedMotion === "true";
    if (forced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(setup, scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
