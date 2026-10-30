"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { formatDate } from "@/lib/format";
import { catalogueService } from "@/services/catalogue.service";
import { statusLabels } from "./labels";

// Dictionary keys arrive camelCased from the wire converter; show them as words.
const words = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").toLowerCase();

/** Honest coverage statement, computed from the catalogue itself. Never claims completeness. */
export function CoveragePanel() {
  const cov = useAsync(() => catalogueService.getCoverage());
  if (cov.status === "loading") return <Skeleton className="mb-6 h-24 rounded-3xl" />;
  if (cov.status === "error") return null;
  const c = cov.data;
  const uncovered = c.jurisdictions.filter((j) => j.kind !== "country" && j.documents === 0);
  const nonCountry = c.jurisdictions.filter((j) => j.kind !== "country");

  return (
    <section aria-label="Coverage" className="mb-8 rounded-3xl border border-brass/40 bg-brass/8 p-5">
      <div className="flex gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-brass" aria-hidden />
        <div className="space-y-2">
          <p className="font-medium">
            {c.counts.rights ?? 0} rights indexed from {c.counts.documents ?? 0} document{(c.counts.documents ?? 0) === 1 ? "" : "s"} · coverage is not complete
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{c.statement}</p>
          <p className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">Audit: {c.auditStatus.replace("_", " ")}</Badge>
            {Object.entries(c.verification).map(([k, n]) => (
              <Badge key={k} variant="outline">
                {n} {words(k)}
              </Badge>
            ))}
            {nonCountry.length > 0 && (
              <Badge variant="outline">
                States and UTs with indexed legislation: {nonCountry.length - uncovered.length} of {nonCountry.length}
              </Badge>
            )}
          </p>
        </div>
      </div>

      {(c.documents.length > 0 || nonCountry.length > 0) && (
        <Disclosure as="div" className="mt-4">
          <DisclosureButton className="group flex items-center gap-1.5 text-sm font-medium text-primary">
            What is indexed
            <ChevronDown className="size-4 transition-transform group-data-[open]:rotate-180" aria-hidden />
          </DisclosureButton>
          <DisclosurePanel className="mt-3 grid gap-6 text-sm md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-eyebrow">Documents</h3>
              <ul className="space-y-2">
                {c.documents.map((d) => (
                  <li key={d.id} className="rounded-xl bg-card/70 p-3">
                    <p className="font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.docType.replace("_", " ")} · {statusLabels[d.repealStatus]}
                      {d.effectiveDate ? ` · in force from ${formatDate(d.effectiveDate)}` : ""}
                    </p>
                    {d.editionNote && <p className="mt-1 text-xs text-muted-foreground">{d.editionNote}</p>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-eyebrow">States and Union Territories</h3>
              <ul className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2" aria-label="State and Union Territory coverage">
                {nonCountry.map((j) => (
                  <li key={j.id} className="flex justify-between gap-2 text-xs">
                    <span>{j.name}</span>
                    <span className="text-muted-foreground">{j.documents === 0 ? "not indexed" : `${j.rights} rights`}</span>
                  </li>
                ))}
              </ul>
            </div>
          </DisclosurePanel>
        </Disclosure>
      )}
    </section>
  );
}
