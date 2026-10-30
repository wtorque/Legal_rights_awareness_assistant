"use client";

import { ArrowLeft, Building2, CircleHelp, ExternalLink, Fingerprint, History, Scale, ScrollText, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SetBreadcrumb } from "@/components/layout/set-breadcrumb";
import { SaveButton } from "@/components/shared/save-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { formatDate } from "@/lib/format";
import { catalogueService } from "@/services/catalogue.service";
import { useChatStore } from "@/stores/chat-store";
import { useSavedStore } from "@/stores/saved-store";
import { useEffect } from "react";
import { OfficialText } from "./official-text";
import { kindLabels, statusLabels, verificationLabels } from "./labels";
import { RightCard } from "./right-card";

function Block({ icon: Icon, title, children }: { icon: typeof Scale; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2.5 text-display-md">
        <Icon className="size-5 text-brass" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium">{children}</dd>
    </div>
  );
}

export function RightDetailView({ id }: { id: string }) {
  const router = useRouter();
  const res = useAsync(() => catalogueService.getRight(id));
  const send = useChatStore((s) => s.send);
  const select = useChatStore((s) => s.select);
  const visit = useSavedStore((s) => s.visitTopic);

  useEffect(() => {
    if (res.status === "ready" && res.data) visit(id);
  }, [res.status, res.data, id, visit]);

  if (res.status === "loading")
    return (
      <PageContainer>
        <Skeleton className="mb-6 h-12 w-2/3" />
        <Skeleton className="h-72 rounded-3xl" />
      </PageContainer>
    );
  if (res.status === "error") return <PageContainer><ErrorState onRetry={res.retry} /></PageContainer>;
  if (!res.data)
    return (
      <PageContainer>
        <EmptyState icon={CircleHelp} title="Right not found" description="This id is not in the catalogue." action={<Button asChild><Link href="/rights">Browse the catalogue</Link></Button>} />
      </PageContainer>
    );

  const d = res.data;
  const r = d.right;
  const amendments = d.provisions.flatMap((p) => p.provision.amendments.map((a) => ({ ...a, locator: p.provision.locator })));

  return (
    <PageContainer className="max-w-4xl">
      <SetBreadcrumb label={r.title} />
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-4">
        <Link href="/rights">
          <ArrowLeft /> Rights catalogue
        </Link>
      </Button>

      <header className="mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brass">{kindLabels[r.kind]}</Badge>
          <Badge variant={r.status === "in_force" ? "neutral" : "warning"}>{statusLabels[r.status]}</Badge>
          {d.sample ? <MockDataBadge label="Fictional sample" /> : <Badge variant="outline">{verificationLabels[r.verification.status]}</Badge>}
        </div>
        <h1 className="text-display-xl">{r.title}</h1>
        <p className="font-mono text-sm text-primary">
          {d.provisions.map((p) => p.provision.locator + (p.refs[0]?.clause ?? "")).join(", ")} · {d.document.title}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            onClick={() => {
              select(null);
              router.push("/assistant");
              void send(`Explain ${r.title} in simple words`);
            }}
          >
            <Sparkles /> Ask the assistant about this
          </Button>
          <SaveButton item={{ kind: "topic", id: r.id, title: r.title, subtitle: kindLabels[r.kind], href: `/rights/${encodeURIComponent(r.id)}` }} />
        </div>
      </header>

      <div className="space-y-12">
        <Block icon={ScrollText} title="Official wording">
          <p className="-mt-2 text-sm text-muted-foreground">Exactly as printed in the source. Superscript numbers refer to the amendment notes below.</p>
          {d.provisions.map(({ provision, refs }) => (
            <Card key={provision.id} className="space-y-3 p-6">
              <p className="font-mono text-xs text-primary">
                {provision.locator}
                {refs[0]?.clause ? ` ${refs[0].clause}` : ""}
                {provision.heading ? ` — ${provision.heading}` : ""}
                {provision.status !== "in_force" ? ` (${statusLabels[provision.status]})` : ""}
              </p>
              <blockquote className="whitespace-pre-line border-l-2 border-brass/60 pl-4 text-[0.95rem] leading-relaxed">
                <OfficialText text={refs[0]?.quote ?? provision.text} />
              </blockquote>
              {refs[0] && refs[0].quote !== provision.text && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-primary">Full text of {provision.locator}</summary>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                    <OfficialText text={provision.text} />
                  </p>
                </details>
              )}
            </Card>
          ))}
        </Block>

        <Block icon={Sparkles} title="In plain language">
          {r.plainLanguage ? (
            <Card variant="tinted" className="p-6">
              <p className="text-lg leading-relaxed">{r.plainLanguage}</p>
            </Card>
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-5 text-sm leading-relaxed text-muted-foreground">
              No plain-language explanation has been written and reviewed for this right yet. It is shown only in the official wording above rather than guessed.
            </p>
          )}
        </Block>

        <Block icon={Scale} title="What kind of entitlement is this?">
          <Card className="space-y-2 p-6">
            <p className="font-medium">{kindLabels[r.kind]}</p>
            <p className="text-sm leading-relaxed">{d.kindExplanation}</p>
            <p className="text-xs text-muted-foreground">Basis for this label: {r.kindBasis}</p>
          </Card>
        </Block>

        <Block icon={Building2} title="Where and how it applies">
          <Card className="p-6">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Row label="Legal domain">{d.domain.name}</Row>
              <Row label="Category">{d.category.name}</Row>
              <Row label="Jurisdiction">{d.jurisdiction.name}</Row>
              <Row label="Document">{d.document.title}</Row>
              <Row label="Document status">{statusLabels[d.document.repealStatus]}</Row>
              <Row label="In force from">
                {d.document.effectiveDate ? `${formatDate(d.document.effectiveDate)}${d.document.effectiveDateBasis ? ` (${d.document.effectiveDateBasis})` : ""}` : "Not recorded"}
              </Row>
            </dl>
            {d.document.editionNote && <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{d.document.editionNote}</p>}
          </Card>
          {(d.remedies.length > 0 || d.authorities.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {d.remedies.map((x) => (
                <Card key={x.id} variant="tinted" className="p-5">
                  <p className="text-eyebrow">Remedy</p>
                  <p className="mt-2 font-medium">{x.title}</p>
                  {x.provisionRefs[0] && <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><OfficialText text={x.provisionRefs[0].quote} /></p>}
                </Card>
              ))}
              {d.authorities.map((a) => (
                <Card key={a.id} variant="tinted" className="p-5">
                  <p className="text-eyebrow">Authority named in the text</p>
                  <p className="mt-2 font-medium">{a.name}</p>
                </Card>
              ))}
            </div>
          )}
        </Block>

        {amendments.length > 0 && (
          <Block icon={History} title="Amendment notes">
            <ul className="space-y-2">
              {amendments.map((a, i) => (
                <li key={i} className="rounded-2xl border border-border bg-card/70 p-4 text-sm leading-relaxed">
                  <span className="mr-2 font-mono text-xs text-brass">{a.locator} · {a.marker}</span>
                  {a.text}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">Notes are quoted from the source and may refer to a neighbouring passage on the same page.</p>
          </Block>
        )}

        <Block icon={Fingerprint} title="Source and verification">
          <Card className="space-y-4 p-6">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Row label="Source">{d.source.name}</Row>
              <Row label="Publisher">{d.source.publisher}</Row>
              <Row label="Location in source">{r.provenance.locator}</Row>
              <Row label="Retrieved">{r.provenance.retrievedAt ? formatDate(r.provenance.retrievedAt) : "—"}</Row>
              <Row label="Verification">{verificationLabels[r.verification.status]}</Row>
              <Row label="Source trust level">{d.source.trustLevel}</Row>
            </dl>
            {r.provenance.sourceUrl && (
              <a href={r.provenance.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                Open the official document <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
            {r.provenance.contentSha256 && (
              <p className="break-all font-mono text-[0.7rem] text-muted-foreground">SHA-256 of the source file: {r.provenance.contentSha256}</p>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">{d.source.identityEvidence}</p>
          </Card>
          <div role="note" className="flex gap-3 rounded-2xl border border-brass/40 bg-brass/10 p-4 text-sm leading-relaxed">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
            <ul className="space-y-1.5">
              {d.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </Block>

        {d.related.length > 0 && (
          <Block icon={Scale} title="Related rights">
            <ul className="grid gap-4 sm:grid-cols-2">
              {d.related.map((x) => (
                <li key={x.id}>
                  <RightCard right={x} />
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>
    </PageContainer>
  );
}
