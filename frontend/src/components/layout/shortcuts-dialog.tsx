"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useUiStore } from "@/stores/ui-store";

const shortcuts: { keys: string[]; label: string }[] = [
  { keys: ["Ctrl/⌘", "K"], label: "Open global search" },
  { keys: ["Ctrl/⌘", "B"], label: "Collapse or expand the sidebar" },
  { keys: ["?"], label: "Show keyboard shortcuts" },
  { keys: ["Esc"], label: "Close dialogs and menus" },
  { keys: ["↑", "↓"], label: "Move through search results" },
  { keys: ["Enter"], label: "Open the selected result" },
];

export function ShortcutsDialog() {
  const open = useUiStore((s) => s.shortcutsOpen);
  const setOpen = useUiStore((s) => s.setShortcutsOpen);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Work faster without leaving the keyboard.</DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-border">
          {shortcuts.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span>{s.label}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
