"use client";

import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

export function GlobalShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ui = useUiStore.getState();
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ui.setSearchOpen(!ui.searchOpen);
      } else if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        ui.toggleSidebar();
      } else if (e.key === "?" && !mod && !isTyping(e.target)) {
        ui.setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
