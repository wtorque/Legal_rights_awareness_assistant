"use client";

import { Toaster as Sonner } from "sonner";
import { useThemeStore } from "@/stores/theme-store";

export function Toaster() {
  const theme = useThemeStore((s) => s.resolved);
  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border !border-border !bg-popover !text-popover-foreground !shadow-lift !font-sans",
          description: "!text-muted-foreground",
        },
      }}
    />
  );
}
