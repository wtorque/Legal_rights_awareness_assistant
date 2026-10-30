import type { Metadata } from "next";
import { ArrowRight, Scale } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MockDataBadge } from "@/components/ui/mock-data-badge";

export const metadata: Metadata = { title: "Design System" };

const swatches = [
  ["background", "bg-background"],
  ["card", "bg-card"],
  ["primary", "bg-primary"],
  ["secondary", "bg-secondary"],
  ["accent", "bg-accent"],
  ["muted", "bg-muted"],
  ["brass", "bg-brass"],
  ["destructive", "bg-destructive"],
] as const;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal className="space-y-5">
      <h2 className="text-eyebrow">{title}</h2>
      {children}
    </Reveal>
  );
}

export default function DesignSystemPage() {
  return (
    <Section flush className="pb-8">
      <PageHeader
        eyebrow="Internal reference"
        title="Design system"
        description="Tokens and primitives shared by every page. Toggle the theme to check both modes."
      />

      <div className="space-y-16">
        <Block title="Colour tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {swatches.map(([name, cls]) => (
              <div key={name} className="space-y-2">
                <div className={`h-20 rounded-2xl border border-border ${cls}`} />
                <p className="font-mono text-xs text-muted-foreground">{name}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Typography">
          <div className="space-y-4">
            <p className="text-display-2xl">Your rights, <em>explained.</em></p>
            <p className="text-display-xl">Display XL</p>
            <p className="text-display-lg">Display LG</p>
            <p className="text-display-md">Display MD</p>
            <p className="text-lead max-w-2xl">
              Lead paragraph in Geist — calm, readable and generous, for explaining dense legal ideas.
            </p>
            <p className="font-mono text-sm text-muted-foreground">Geist Mono — Section 12(3)</p>
          </div>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary <ArrowRight /></Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Scale"><Scale /></Button>
            <Button disabled>Disabled</Button>
          </div>
        </Block>

        <Block title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge variant="brand">Brand</Badge>
            <Badge variant="brass">Brass</Badge>
            <Badge variant="outline">Outline</Badge>
            <MockDataBadge />
          </div>
        </Block>

        <Block title="Cards">
          <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(["solid", "glass", "tinted", "outline"] as const).map((variant) => (
              <RevealItem key={variant}>
                <Card variant={variant} interactive className="h-full">
                  <CardHeader>
                    <CardTitle>{variant}</CardTitle>
                    <CardDescription>Rounded card, hover to lift.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Badge variant="outline">variant=&quot;{variant}&quot;</Badge>
                  </CardContent>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        </Block>
      </div>
    </Section>
  );
}
