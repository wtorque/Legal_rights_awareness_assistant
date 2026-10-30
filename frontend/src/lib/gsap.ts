"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Register GSAP plugins once, client-side only. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
  return gsap;
}

registerGsap();

export { gsap, ScrollTrigger };
