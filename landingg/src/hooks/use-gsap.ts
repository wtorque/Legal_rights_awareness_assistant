"use client";

import { type RefObject, useEffect } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Run GSAP code scoped to a container; everything created inside is reverted on unmount.
 * Skipped entirely when the user prefers reduced motion.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (ctx: gsap.Context) => void,
  deps: React.DependencyList = [],
) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context((self) => setup(self), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
