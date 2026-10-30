"use client";

import { BookOpen, ChevronDown, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MockDataBadge } from "@/components/ui/mock-data-badge";
import { popularCategories } from "@/mocks/dashboard";
import type { LearningResource, TopicSummary } from "@/types/dashboard";

export function KnowledgeDiscovery({ topics, learning }: { topics: TopicSummary[]; learning: LearningResource[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = popularCategories.filter((category) =>
    topics.some((topic) => topic.category === category.toLowerCase()),
  );
  const visibleTopics = selectedCategory
    ? topics.filter((topic) => topic.category === selectedCategory.toLowerCase())
    : topics;

  return (
    <section aria-labelledby="discover-heading" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-eyebrow">Discover</p>
          <h2 id="discover-heading" className="text-display-md mt-2">
            Legal knowledge
          </h2>
        </div>
        <MockDataBadge />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter topics by category">
        <Button
          variant={selectedCategory === null ? "primary" : "outline"}
          size="sm"
          aria-pressed={selectedCategory === null}
          onClick={() => setSelectedCategory(null)}
        >
          All topics
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "primary" : "outline"}
            size="sm"
            aria-pressed={selectedCategory === category}
            onClick={() => setSelectedCategory((current) => (current === category ? null : category))}
          >
            {category}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {selectedCategory
          ? `Showing ${visibleTopics.length} ${selectedCategory.toLowerCase()} topic${visibleTopics.length === 1 ? "" : "s"}.`
          : `Showing all ${visibleTopics.length} topics.`}
      </p>

      {visibleTopics.length > 0 ? (
        <RevealGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" gap={0.06}>
          {visibleTopics.map((topic) => (
            <RevealItem key={topic.slug}>
              <Link href={`/rights/${topic.slug}`} className="block h-full rounded-3xl">
                <Card interactive className="flex h-full flex-col gap-2 p-5">
                  <Badge variant="brass" className="w-fit capitalize">
                    {topic.category.replace("-", " ")}
                  </Badge>
                  <p className="mt-1 font-medium">{topic.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{topic.summary}</p>
                </Card>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <p className="rounded-2xl border border-border p-5 text-sm text-muted-foreground">
          No sample topics are available yet.
        </p>
      )}

      <Card variant="tinted" className="p-5 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 font-medium">
          <BookOpen className="size-4 text-primary" aria-hidden /> Recommended learning
        </h3>
        <ul className="grid gap-3 md:grid-cols-3">
          {learning.map((resource) => (
            <li key={resource.id}>
              <details className="group rounded-2xl bg-card/70 p-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                  <span>
                    <span className="block text-sm font-medium leading-snug">{resource.title}</span>
                    <span className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{resource.kind}</Badge>
                      <Clock className="size-3" aria-hidden /> {resource.minutes} min
                    </span>
                  </span>
                  <ChevronDown
                    className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                  {resource.description}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
