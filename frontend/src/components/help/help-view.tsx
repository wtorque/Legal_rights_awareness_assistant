"use client";

import { Keyboard } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Accordion } from "@/components/rights/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { siteConfig } from "@/config/site";
import { useUiStore } from "@/stores/ui-store";

const faqs = [
  {
    id: "what",
    title: "What is Aequa?",
    body: "Aequa helps people understand everyday legal rights in plain language, with answers that point to their sources. It gives general information, not legal advice.",
  },
  {
    id: "sample",
    title: "Why does everything say “sample”?",
    body: "This is a prototype. All answers, documents, topics and sources are fictional fixtures so that screens can be tested. They are not real law and have not been verified. Real organisations in the Legal Aid Finder are the exception: those were checked against their own websites.",
  },
  {
    id: "data",
    title: "Where is my data stored?",
    body: "Only in your browser. Conversations, plans and bookmarks use local storage. Files you add are not uploaded. See Settings → Privacy to export or delete everything.",
  },
  {
    id: "docs",
    title: "Does document analysis read my file?",
    body: "Not yet. For files you add, the analysis panel shows a fixed demonstration so you can see how results will look. Sample documents have their own fictional analysis.",
  },
  {
    id: "lawyer",
    title: "Can I rely on this instead of a lawyer?",
    body: "No. Use it to understand the basics and prepare questions. For decisions with real consequences, contact a legal aid service or a qualified lawyer.",
  },
];

export function HelpView() {
  const openShortcuts = useUiStore((s) => s.setShortcutsOpen);
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Help & support" description="How the prototype works and what to keep in mind." meta={<MockDataBadge label="Prototype build" />} />

      <div className="space-y-10">
        <Card variant="tinted" className="p-6">
          <h2 className="text-display-md">Important</h2>
          <p className="mt-2 text-sm leading-relaxed">{siteConfig.disclaimer}</p>
        </Card>

        <section aria-labelledby="faq" className="space-y-4">
          <h2 id="faq" className="text-display-md">
            Common questions
          </h2>
          <Accordion items={faqs} />
        </section>

        <section aria-labelledby="tips" className="space-y-4">
          <h2 id="tips" className="text-display-md">
            Getting around
          </h2>
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">Press Ctrl/⌘ K anywhere to search, or Ctrl/⌘ B to collapse the sidebar.</p>
            <Button variant="outline" onClick={() => openShortcuts(true)}>
              <Keyboard /> View shortcuts
            </Button>
          </Card>
        </section>

        <section aria-labelledby="contact" className="space-y-3">
          <h2 id="contact" className="text-display-md">
            Contact
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">There is no support channel in the prototype. For urgent legal help, use the Legal Aid Finder.</p>
        </section>
      </div>
    </PageContainer>
  );
}
