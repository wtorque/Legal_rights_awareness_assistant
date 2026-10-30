"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { type SavedItem, useSavedStore } from "@/stores/saved-store";
import { savedKey } from "@/stores/saved-store";

/** Bookmark toggle backed by the local saved store. */
export function SaveButton({ item, className }: { item: Omit<SavedItem, "key" | "savedAt">; className?: string }) {
  const saved = useSavedStore((s) => s.items.some((i) => i.key === savedKey(item.kind, item.id)));
  const toggle = useSavedStore((s) => s.toggle);
  return (
    <Button
      variant={saved ? "secondary" : "outline"}
      size="sm"
      aria-pressed={saved}
      className={className}
      onClick={() => toast.success(toggle(item) ? "Saved to your resources" : "Removed from saved")}
    >
      {saved ? <BookmarkCheck /> : <Bookmark />}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
