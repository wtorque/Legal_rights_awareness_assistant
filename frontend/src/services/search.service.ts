import { allNavItems } from "@/config/navigation";
import type { SearchResult } from "@/types/search";
import { actionPlansService } from "./action-plans.service";
import { chatService } from "./chat.service";
import { documentsService } from "./documents.service";
import { knowledgeService } from "./knowledge.service";
import { catalogueService } from "./catalogue.service";

export interface SearchService {
  search(query: string): Promise<SearchResult[]>;
}

const includes = (haystack: string, q: string) => haystack.toLowerCase().includes(q);

/**
 * Frontend aggregate over the module services. A backend search endpoint can replace this
 * single function without touching the overlay.
 */
export const searchService: SearchService = {
  async search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const [rights, sources, documents, plans, conversations] = await Promise.all([
      catalogueService.searchRights({ text: q, limit: 5 }),
      knowledgeService.search({ text: q }),
      documentsService.list(),
      actionPlansService.list(),
      chatService.listConversations(),
    ]);

    const pages: SearchResult[] = allNavItems
      .filter((n) => includes(`${n.label} ${n.description}`, q))
      .map((n) => ({ id: `page:${n.href}`, group: "Pages", title: n.label, subtitle: n.description, href: n.href }));

    return [
      ...pages,
      ...rights.items.map<SearchResult>((r) => ({ id: `right:${r.id}`, group: "Rights", title: r.title, subtitle: `${r.category.name} · ${r.locators.join(", ")}`, href: `/rights/${encodeURIComponent(r.id)}` })),
      ...conversations
        .filter((c) => includes(`${c.title} ${c.messages.map((m) => (m.role === "user" ? m.content : "")).join(" ")}`, q))
        .slice(0, 5)
        .map<SearchResult>((c) => ({ id: `conv:${c.id}`, group: "Conversations", title: c.title, subtitle: `${c.messages.length} messages`, href: "/assistant", conversationId: c.id })),
      ...documents.filter((d) => includes(d.name, q)).slice(0, 5).map<SearchResult>((d) => ({ id: `doc:${d.id}`, group: "Documents", title: d.name, subtitle: d.category, href: `/documents/${d.id}` })),
      ...sources.slice(0, 5).map<SearchResult>((s) => ({ id: `src:${s.id}`, group: "Legal sources", title: s.title, subtitle: s.authority, href: `/knowledge/${s.id}` })),
      ...plans.filter((p) => includes(`${p.title} ${p.situation}`, q)).slice(0, 5).map<SearchResult>((p) => ({ id: `plan:${p.id}`, group: "Action plans", title: p.title, subtitle: p.category.replace("-", " "), href: `/action-plans/${p.id}` })),
    ];
  },
};
