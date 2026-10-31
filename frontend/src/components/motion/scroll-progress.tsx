"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** A thin bar at the top of the window that fills as the page scrolls. Decorative: hidden from assistive tech. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[90] h-0.5 origin-left bg-brass" />;
}
