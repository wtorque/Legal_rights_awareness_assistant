"use client";

import { ExternalLink, MousePointerClick, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import type { EvidenceEdge, EvidenceNode } from "@/types/evidence";
import { kindMeta } from "./node-style";

interface NodeDetailsProps {
  node: EvidenceNode | null;
  edges: EvidenceEdge[];
  nodesById: Map<string, EvidenceNode>;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function NodeDetails({ node, edges, nodesById, onSelect, onClose }: NodeDetailsProps) {
  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
          <MousePointerClick className="size-5" aria-hidden />
        </span>
        <p className="font-medium">Select a node</p>
        <p className="max-w-[16rem] text-sm leading-relaxed text-muted-foreground">Click any node to see its details, where it comes from and what it connects to.</p>
      </div>
    );
  }

  const meta = kindMeta[node.kind];
  const links = edges
    .filter((e) => e.from === node.id || e.to === node.id)
    .map((e) => {
      const otherId = e.from === node.id ? e.to : e.from;
      return { relation: e.relation, outgoing: e.from === node.id, other: nodesById.get(otherId) };
    })
    .filter((l): l is { relation: string; outgoing: boolean; other: EvidenceNode } => !!l.other);

  return (
    <div className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.chip}`}>
            <meta.icon className="size-3.5" aria-hidden /> {meta.label}
          </span>
          <h2 className="font-display text-2xl leading-tight">{node.label}</h2>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Clear selection">
          <X />
        </Button>
      </div>
      <p className="text-sm leading-relaxed">{node.description}</p>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Source information</dt>
          <dd className="mt-0.5 font-medium">{node.provenance}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Status</dt>
          <dd className="mt-1">
            <MockDataBadge label="Sample · not verified" />
          </dd>
        </div>
      </dl>
      {node.href && (
        <Button asChild variant="outline" size="sm">
          <Link href={node.href}>
            Open <ExternalLink />
          </Link>
        </Button>
      )}
      <div>
        <h3 className="mb-2 text-eyebrow">Connections ({links.length})</h3>
        <ul className="space-y-1.5">
          {links.map((l) => (
            <li key={`${l.other.id}-${l.relation}`}>
              <button type="button" onClick={() => onSelect(l.other.id)} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition-colors hover:bg-secondary">
                <span className="shrink-0 text-xs text-muted-foreground">{l.outgoing ? l.relation : `← ${l.relation}`}</span>
                <span className="truncate font-medium">{l.other.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
