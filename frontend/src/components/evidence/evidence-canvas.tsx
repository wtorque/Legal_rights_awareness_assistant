"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Edge,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Maximize, Search, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/theme-store";
import type { EvidenceGraphData, EvidenceNodeKind } from "@/types/evidence";
import { LegalNode, type LegalFlowNode } from "./legal-node";
import { NodeDetails } from "./node-details";
import { kindOrder } from "./node-style";

const nodeTypes = { legal: LegalNode };

/** Authorities and sources share the last column so the graph stays compact. */
const columnOf = (kind: EvidenceNodeKind) => (kind === "source" ? kindOrder.indexOf("authority") : kindOrder.indexOf(kind));

/** Column per node kind, rows stacked: readable without a layout library. */
function layout(data: EvidenceGraphData): LegalFlowNode[] {
  const rowByColumn = new Map<number, number>();
  return data.nodes.map((node) => {
    const column = columnOf(node.kind);
    const row = rowByColumn.get(column) ?? 0;
    rowByColumn.set(column, row + 1);
    return {
      id: node.id,
      type: "legal",
      position: { x: column * 270, y: row * 105 + (column % 2) * 35 },
      data: { node, dimmed: false, selected: false, matched: false },
    };
  });
}

function Canvas({ graph }: { graph: EvidenceGraphData }) {
  const colorMode = useThemeStore((s) => s.resolved);
  const { fitView } = useReactFlow();
  const initialNodes = useMemo(() => layout(graph), [graph]);
  const [nodes, , onNodesChange] = useNodesState<LegalFlowNode>(initialNodes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focusRelated, setFocusRelated] = useState(true);

  const nodesById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);

  const neighbours = useMemo(() => {
    const set = new Set<string>();
    if (!selectedId) return set;
    set.add(selectedId);
    for (const e of graph.edges) {
      if (e.from === selectedId) set.add(e.to);
      if (e.to === selectedId) set.add(e.from);
    }
    return set;
  }, [selectedId, graph.edges]);

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => new Set(q ? graph.nodes.filter((n) => `${n.label} ${n.description}`.toLowerCase().includes(q)).map((n) => n.id) : []),
    [q, graph.nodes],
  );

  const displayNodes = useMemo<LegalFlowNode[]>(
    () =>
      nodes.map((n) => {
        const dimByFocus = focusRelated && selectedId !== null && !neighbours.has(n.id);
        const dimBySearch = q !== "" && !matches.has(n.id);
        return { ...n, data: { ...n.data, dimmed: dimByFocus || dimBySearch, selected: n.id === selectedId, matched: matches.has(n.id) } };
      }),
    [nodes, selectedId, neighbours, focusRelated, q, matches],
  );

  const edges = useMemo<Edge[]>(
    () =>
      graph.edges.map((e) => {
        const active = selectedId !== null && (e.from === selectedId || e.to === selectedId);
        return {
          id: e.id,
          source: e.from,
          target: e.to,
          label: active ? e.relation : undefined,
          animated: active,
          style: {
            stroke: active ? "var(--primary)" : "var(--muted-foreground)",
            strokeWidth: active ? 2.5 : 1.25,
            opacity: selectedId && !active && focusRelated ? 0.15 : 0.7,
          },
          labelStyle: { fill: "var(--foreground)", fontSize: 11 },
          labelBgStyle: { fill: "var(--card)" },
        };
      }),
    [graph.edges, selectedId, focusRelated],
  );

  // Frame matching nodes as the user types.
  useEffect(() => {
    if (matches.size > 0) void fitView({ nodes: Array.from(matches).map((id) => ({ id })), duration: 500, padding: 0.4, maxZoom: 1.2 });
  }, [matches, fitView]);

  const select = useCallback((id: string | null) => setSelectedId(id), []);
  const selectedNode = selectedId ? (nodesById.get(selectedId) ?? null) : null;

  return (
    <div className="grid lg:h-[calc(100dvh-8.5rem)] lg:min-h-[32rem] lg:grid-cols-[1fr_22rem]">
      <div className="relative h-[65dvh] min-h-[24rem] lg:h-auto">
        <ReactFlow<LegalFlowNode>
          nodes={displayNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={(_, node) => select(node.id === selectedId ? null : node.id)}
          onPaneClick={() => select(null)}
          colorMode={colorMode}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          aria-label="Legal evidence graph"
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
          <Controls showInteractive={false} showFitView={false} />
          <MiniMap pannable zoomable className="!hidden sm:!block" nodeColor="var(--primary)" maskColor="color-mix(in oklab, var(--background) 70%, transparent)" />
        </ReactFlow>

        <div className="absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes"
              aria-label="Search nodes"
              className="glass h-10 w-56 rounded-full pl-10 pr-9"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear node search" className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full hover:bg-secondary">
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Hint label="Fit graph to screen">
            <Button variant="glass" size="icon" onClick={() => void fitView({ duration: 500, padding: 0.08 })} aria-label="Fit to screen">
              <Maximize />
            </Button>
          </Hint>
          <Button variant="glass" size="sm" aria-pressed={focusRelated} onClick={() => setFocusRelated((v) => !v)} className={cn(focusRelated && "border-primary/50")}>
            <Sparkles /> Highlight related
          </Button>
          {q && (
            <span role="status" className="glass rounded-full px-3 py-1.5 text-xs">
              {matches.size} match{matches.size === 1 ? "" : "es"}
            </span>
          )}
        </div>
      </div>

      <aside aria-label="Node details" className="overflow-y-auto border-t border-border bg-card/60 lg:border-l lg:border-t-0">
        <NodeDetails node={selectedNode} edges={graph.edges} nodesById={nodesById} onSelect={select} onClose={() => select(null)} />
      </aside>
    </div>
  );
}

export function EvidenceCanvas({ graph }: { graph: EvidenceGraphData }) {
  return (
    <ReactFlowProvider>
      <Canvas graph={graph} />
    </ReactFlowProvider>
  );
}
