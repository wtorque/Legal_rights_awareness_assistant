"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/stores/theme-store";

/**
 * Both icons are always in the DOM and swapped with CSS (`dark:` variant), so server
 * and client markup match and the correct icon shows before hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = useThemeStore((s) => s.toggle);
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={className}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
    >
      <Sun className="size-[1.15rem] rotate-0 scale-100 transition-transform duration-500 ease-out-expo dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[1.15rem] rotate-90 scale-0 transition-transform duration-500 ease-out-expo dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
