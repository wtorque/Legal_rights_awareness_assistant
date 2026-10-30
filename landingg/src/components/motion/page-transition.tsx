"use client";

import { motion } from "framer-motion";
import { transitions } from "@/lib/motion";

/** Enter animation for route content. Used from template.tsx so it replays per navigation. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.base}
    >
      {children}
    </motion.div>
  );
}
