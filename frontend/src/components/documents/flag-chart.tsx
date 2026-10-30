"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Clause, ClauseFlag } from "@/types/documents";
import { flagMeta } from "./flag-badge";

const colors: Record<ClauseFlag, string> = {
  attention: "var(--brass)",
  ambiguous: "var(--ring)",
  obligation: "var(--primary)",
  missing: "var(--muted-foreground)",
};

/** Clause counts per reading-aid label. Decorative summary: the same numbers are in the table below. */
export function FlagChart({ clauses }: { clauses: Clause[] }) {
  const data = (Object.keys(flagMeta) as ClauseFlag[]).map((flag) => ({
    flag,
    label: flagMeta[flag].label,
    count: clauses.filter((c) => c.flag === flag).length,
  }));

  return (
    <figure>
      <div className="h-44 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis type="category" dataKey="label" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip
              cursor={{ fill: "var(--secondary)" }}
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              formatter={(v) => [`${v} clause${v === 1 ? "" : "s"}`, ""]}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={16} isAnimationActive>
              {data.map((d) => (
                <Cell key={d.flag} fill={colors[d.flag]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {data.map((d) => `${d.label}: ${d.count}`).join(", ")}
      </figcaption>
    </figure>
  );
}
