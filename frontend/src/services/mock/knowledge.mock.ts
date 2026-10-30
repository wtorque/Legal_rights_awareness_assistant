import { delay } from "@/lib/mock-storage";
import { knowledgeById, knowledgeSources } from "@/mocks/knowledge";
import type { KnowledgeService } from "../knowledge.service";

export const mockKnowledgeService: KnowledgeService = {
  async search({ text, countryCode, category, docType }) {
    await delay(300);
    const q = text?.trim().toLowerCase();
    return knowledgeSources.filter(
      (s) =>
        (!countryCode || countryCode === "all" || s.countryCode === countryCode) &&
        (!category || category === "all" || s.category === category) &&
        (!docType || docType === "all" || s.docType === docType) &&
        (!q || `${s.title} ${s.authority} ${s.description} ${s.sections.map((x) => x.label + x.summary).join(" ")}`.toLowerCase().includes(q)),
    );
  },
  async get(id) {
    await delay(200);
    return knowledgeById(id) ?? null;
  },
};
