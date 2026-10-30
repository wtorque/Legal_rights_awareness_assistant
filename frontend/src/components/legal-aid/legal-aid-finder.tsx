"use client";

import { ExternalLink, HandHelping, Info, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SaveButton } from "@/components/shared/save-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { countries, getCountry } from "@/config/jurisdictions";
import { formatDate } from "@/lib/format";
import { legalAidService } from "@/services/legal-aid.service";
import { usePreferencesStore } from "@/stores/preferences-store";
import type { LegalAidCategory, LegalAidOrganization } from "@/types/legal-aid";

const categoryLabels: Record<LegalAidCategory, string> = {
  government: "Government legal aid",
  authority: "Legal services authority",
  "public-resource": "Public legal assistance",
};

export function LegalAidFinder() {
  const prefCountry = usePreferencesStore((s) => s.country);
  const prefRegion = usePreferencesStore((s) => s.region);
  const [country, setCountry] = useState(prefCountry);
  const [region, setRegion] = useState<string>(prefRegion ?? "");
  const [category, setCategory] = useState<LegalAidCategory | "all">("all");
  const [text, setText] = useState("");
  const [orgs, setOrgs] = useState<LegalAidOrganization[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const current = getCountry(country);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      legalAidService.search({ countryCode: country, regionCode: region || null, category, text }).then(
        (r) => {
          if (cancelled) return;
          setOrgs(r);
          setError(false);
        },
        () => !cancelled && setError(true),
      );
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [country, region, category, text, attempt]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Legal aid"
        title="Find legal assistance"
        description="Government and public services that offer legal help. Details below were checked against each organisation's own website."
      />

      <div role="note" className="mb-8 flex gap-3 rounded-2xl border border-border bg-secondary/50 p-4 text-sm leading-relaxed">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p>
          We list only what could be confirmed on the official sites, so some entries have no phone number or address. Eligibility and availability can change; always confirm with the organisation.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="la-country">Country</Label>
          <Select
            id="la-country"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setRegion("");
            }}
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="la-region">{current.regionLabel}</Label>
          <Select id="la-region" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">Any</option>
            {current.regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="la-cat">Type of help</Label>
          <Select id="la-cat" value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
            <option value="all">All types</option>
            {Object.entries(categoryLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="la-text">Search</Label>
          <Input id="la-text" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. helpline" />
        </div>
      </div>

      {error ? (
        <ErrorState onRetry={() => setAttempt((n) => n + 1)} />
      ) : orgs === null ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <EmptyState
          icon={HandHelping}
          title="No listings for this selection yet"
          description={`We haven't verified any services for ${current.name}${region ? " in this region" : ""} matching these filters. Try “Any” for region or a different country.`}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {orgs.map((o) => (
            <li key={o.id}>
              <Card className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Badge variant="brass">{categoryLabels[o.category]}</Badge>
                    <h2 className="font-display text-2xl leading-snug">{o.name}</h2>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{o.description}</p>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Eligibility</dt>
                    <dd className="mt-0.5">{o.eligibility}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Services</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {o.services.map((s) => (
                        <Badge key={s} variant="outline">
                          {s}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {o.phone && (
                      <div>
                        <dt className="text-xs text-muted-foreground">Phone</dt>
                        <dd className="mt-0.5">
                          <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                            <Phone className="size-3.5" aria-hidden /> {o.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {o.website && (
                      <div>
                        <dt className="text-xs text-muted-foreground">Official website</dt>
                        <dd className="mt-0.5">
                          <a href={o.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                            {new URL(o.website).hostname.replace(/^www\./, "")} <ExternalLink className="size-3.5" aria-hidden />
                          </a>
                        </dd>
                      </div>
                    )}
                    {!o.phone && !o.website && <p className="text-muted-foreground">No verified contact details yet.</p>}
                  </div>
                </dl>
                <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground" title={o.verification.method}>
                    <ShieldCheck className="size-3.5 text-primary" aria-hidden /> Checked {formatDate(o.verification.checkedOn)}
                  </p>
                  <SaveButton className="ml-auto" item={{ kind: "legal-aid", id: o.id, title: o.name, subtitle: categoryLabels[o.category], href: "/legal-aid" }} />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{o.verification.method}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
