import type { DataOrigin } from "./common";

export type EvidenceNodeKind = "question" | "document" | "section" | "authority" | "source" | "topic";

export interface EvidenceNode {
  id: string;
  kind: EvidenceNodeKind;
  label: string;
  description: string;
  /** Where this node comes from, shown in the detail panel. */
  provenance: string;
  /** In-app page for the underlying item, if one exists. */
  href: string | null;
  origin: DataOrigin;
}

export interface EvidenceEdge {
  id: string;
  from: string;
  to: string;
  relation: string;
}

export interface EvidenceGraphData {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}
