"use client";

import { useEffect } from "react";
import { THEME_STORAGE_KEY, useThemeStore } from "@/stores/theme-store";

/**
 * Runs before first paint (inline in <head>) so there is no theme flash.
 * Must stay in sync with the store's apply() logic.
 */
export const themeInitScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var p=localStorage.getItem(k);if(p!=="light"&&p!=="dark")p="system";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.dataset.theme=d?"dark":"light";r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const init = useThemeStore((s) => s.init);
  useEffect(() => init(), [init]);
  return <>{children}</>;
}
