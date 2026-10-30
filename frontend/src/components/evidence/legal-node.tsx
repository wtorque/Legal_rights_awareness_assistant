"use client";

import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { EvidenceNode } from "@/types/evidence";
import { kindMeta } from "./node-style";

export type LegalNodeData = {
  node: EvidenceNode;
  dimmed: boolean;
  selected: boolean;
  matched: boolean;
};
export type LegalFlowNode = Node<LegalNodeData, "legal">;

export function LegalNode({ data }: NodeProps<LegalFlowNode>) {
  const meta = kindMeta[data.node.kind];
  return (
    <div
      className={cn(
        "flex w-52 items-center gap-3 rounded-2xl border-2 bg-card px-3.5 py-3 shadow-soft transition-[opacity,box-shadow,transform] duration-300",
        meta.ring,
        data.dimmed && "opacity-25",
        data.selected && "scale-[1.04] shadow-lift ring-4 ring-primary/25",
        data.matched && !data.selected && "ring-4 ring-brass/40",
      )}
    >
      <Handle type="target" position={Position.Left} className="!size-2 !border-0 !bg-muted-foreground/60" />
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", meta.chip)}>
        <meta.icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.62rem] font-medium uppercase tracking-wider text-muted-foreground">{meta.label}</span>
        <span className="block text-sm font-medium leading-snug">{data.node.label}</span>
      </span>
      <Handle type="source" position={Position.Right} className="!size-2 !border-0 !bg-muted-foreground/60" />
    </div>
  );
}
