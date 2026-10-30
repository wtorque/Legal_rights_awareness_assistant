"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeIn, fadeUp, stagger } from "@/lib/motion";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView"> {
  /** Seconds to wait before the reveal starts. */
  delay?: number;
  /** "up" slides in from below; "fade" only fades. */
  effect?: "up" | "fade";
  /** Re-play each time the element enters the viewport. */
  repeat?: boolean;
}

/** Fade (and optionally lift) an element into view once it scrolls on screen. */
export function Reveal({ delay = 0, effect = "up", repeat = false, ...props }: RevealProps) {
  return (
    <motion.div
      variants={effect === "up" ? fadeUp : fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !repeat, margin: "0px 0px -12% 0px" }}
      transition={{ delay }}
      {...props}
    />
  );
}

/** Container that staggers any `<RevealItem>` children. */
export function RevealGroup({
  gap = 0.08,
  delay = 0,
  ...props
}: Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView"> & {
  gap?: number;
  delay?: number;
}) {
  return (
    <motion.div
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      {...props}
    />
  );
}

export function RevealItem(props: Omit<HTMLMotionProps<"div">, "variants">) {
  return <motion.div variants={fadeUp} {...props} />;
}
