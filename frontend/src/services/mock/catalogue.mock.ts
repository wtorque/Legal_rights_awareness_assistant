import { delay } from "@/lib/mock-storage";
import { getSampleSource } from "@/mocks/legal-sources";
import { rightsCategories, rightsTopics } from "@/mocks/rights";
import type {
  Coverage, FacetName, FacetOption, RightDetail, RightSummary, RightsPage, RightsQuery, Verification,
} from "@/types/catalogue";
import type { RightsTopic } from "@/types/rights";
import type { CatalogueService } from "../catalogue.service";

/**
 * FICTIONAL catalogue used when no backend is configured. Same shape as the real API, always flagged `sample`.
 */
const verification: Verification = { status: "unverified", checkedBy: null, checkedAt: null, notes: "Fixture content", needsReview: true };
const categoryName = (id: string) => rightsCategories.find((c) => c.id === id)?.name ?? id;

function summary(t: RightsTopic): RightSummary {
  return {
    id: t.slug,
    title: t.title,
    kind: "enforceable_right",
    status: "in_force",
    domain: { id: "sample", name: "Sample domain (fictional)" },
    category: { id: t.category, name: categoryName(t.category) },
    jurisdiction: { id: "SAMPLE", name: "Sample jurisdiction" },
    documentTitle: getSampleSource(t.provisions[0].sourceId).documentTitle,
    locators: t.provisions.map((p) => getSampleSource(p.sourceId).sectionLabel),
    excerpt: t.overview,
    verification,
    effectiveDate: null,
    sample: true,
  };
}

const all = rightsTopics.map(summary);

function facetOf(rows: RightSummary[], key: (r: RightSummary) => { id: string; label: string }): FacetOption[] {
  const map = new Map<string, FacetOption>();
  for (const r of rows) {
    const k = key(r);
    map.set(k.id, { id: k.id, label: k.label, count: (map.get(k.id)?.count ?? 0) + 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

function apply(q: RightsQuery, skip?: string): RightSummary[] {
  const text = q.text?.trim().toLowerCase();
  return all.filter(
    (r) =>
      (skip === "category" || !q.category || r.category.id === q.category) &&
      (skip === "kind" || !q.kind || r.kind === q.kind) &&
      (skip === "verification" || !q.verification || r.verification.status === q.verification) &&
      (!text || `${r.title} ${r.excerpt}`.toLowerCase().includes(text)),
  );
}

export const mockCatalogueService: CatalogueService = {
  async searchRights(q) {
    await delay(250);
    const rows = apply(q);
    const limit = q.limit ?? 24;
    const offset = q.offset ?? 0;
    const facets: Record<FacetName, FacetOption[]> = {
      domains: facetOf(rows, (r) => ({ id: r.domain.id, label: r.domain.name })),
      categories: facetOf(apply(q, "category"), (r) => ({ id: r.category.id, label: r.category.name })),
      kinds: facetOf(apply(q, "kind"), (r) => ({ id: r.kind, label: r.kind })),
      jurisdictions: facetOf(rows, (r) => ({ id: r.jurisdiction.id, label: r.jurisdiction.name })),
      verification: facetOf(apply(q, "verification"), (r) => ({ id: r.verification.status, label: r.verification.status })),
      status: facetOf(rows, (r) => ({ id: r.status, label: r.status })),
    };
    return { items: rows.slice(offset, offset + limit), total: rows.length, nextOffset: offset + limit < rows.length ? offset + limit : null, facets } satisfies RightsPage;
  },

  async getRight(id) {
    await delay(200);
    const t = rightsTopics.find((x) => x.slug === id);
    if (!t) return null;
    const s = summary(t);
    const sources = t.provisions.map((p) => getSampleSource(p.sourceId));
    const detail: RightDetail = {
      right: { id: t.slug, title: t.title, titleBasis: "Fixture", kind: "enforceable_right", kindBasis: "Fixture", status: "in_force", effectiveDate: null, plainLanguage: t.simpleExplanation, provenance: { sourceId: "sample", sourceUrl: "", retrievedAt: "", contentSha256: "", locator: "Sample" }, verification },
      domain: s.domain,
      category: { ...s.category, nameBasis: "Fixture" },
      jurisdiction: { ...s.jurisdiction, kind: "sample" },
      document: { id: "sample", title: s.documentTitle, docType: "other", officialUrl: "", effectiveDate: null, effectiveDateBasis: null, editionNote: "Fictional fixture. Not a real law.", repealStatus: "in_force" },
      source: { id: "sample", name: "Sample fixture", publisher: "Aequa fixtures", trustLevel: "unverified", identityEvidence: "Fictional content for demonstration.", verification },
      provisions: sources.map((src) => ({
        provision: { id: src.id, locator: src.sectionLabel, number: src.sectionLabel, heading: src.documentTitle, text: src.quote, part: null, groupHeading: null, status: "in_force", amendments: [], provenance: { sourceId: "sample", sourceUrl: "", retrievedAt: "", contentSha256: "", locator: "Sample" }, verification },
        refs: [{ provisionId: src.id, clause: null, quote: src.quote }],
      })),
      authorities: [],
      remedies: [],
      related: rightsTopics.filter((x) => t.related.includes(x.slug)).map(summary),
      kindExplanation: "Fixture entry: this does not describe a real right.",
      caveats: ["This is fictional sample content, not law.", ...t.commonSituations.slice(0, 0)],
      sample: true,
    };
    return detail;
  },

  async getCoverage() {
    await delay(150);
    return {
      complete: false,
      auditStatus: "not_started",
      statement: "Sample catalogue: fictional fixtures only. No real legal source is indexed in this mode.",
      counts: { rights: all.length, documents: 0, sources: 0 },
      verification: { unverified: all.length },
      kinds: { enforceable_right: all.length },
      documents: [],
      jurisdictions: [],
      sample: true,
    } satisfies Coverage;
  },
};
