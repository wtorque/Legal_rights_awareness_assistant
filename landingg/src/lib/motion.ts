import type { Transition, Variants } from "framer-motion";

/** Shared easing curves — keep every animation on the same few feels. */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  spring: { type: "spring", stiffness: 380, damping: 32, mass: 0.8 },
} as const;

export const duration = {
  fast: 0.18,
  base: 0.4,
  slow: 0.8,
} as const;

export const transitions = {
  base: { duration: duration.base, ease: ease.out } satisfies Transition,
  slow: { duration: duration.slow, ease: ease.out } satisfies Transition,
  spring: ease.spring satisfies Transition,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitions.slow },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});
