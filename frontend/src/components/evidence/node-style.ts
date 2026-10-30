import { CircleHelp, FileText, Landmark, Library, ScrollText, Tag, type LucideIcon } from "lucide-react";
import type { EvidenceNodeKind } from "@/types/evidence";

export const kindMeta: Record<EvidenceNodeKind, { label: string; icon: LucideIcon; ring: string; chip: string }> = {
  question: { label: "Legal question", icon: CircleHelp, ring: "border-brass", chip: "bg-brass/15 text-brass" },
  document: { label: "Legal document", icon: FileText, ring: "border-primary", chip: "bg-primary/10 text-primary" },
  section: { label: "Section", icon: ScrollText, ring: "border-sky", chip: "bg-sky text-secondary-foreground" },
  authority: { label: "Authority", icon: Landmark, ring: "border-foreground/40", chip: "bg-secondary text-secondary-foreground" },
  source: { label: "Source", icon: Library, ring: "border-primary/50", chip: "bg-accent text-accent-foreground" },
  topic: { label: "Related topic", icon: Tag, ring: "border-brass/60", chip: "bg-brass/10 text-brass" },
};

export const kindOrder: EvidenceNodeKind[] = ["question", "topic", "document", "section", "authority", "source"];
