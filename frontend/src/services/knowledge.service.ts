import type { KnowledgeQuery, KnowledgeSource } from "@/types/knowledge";
import { mockKnowledgeService } from "./mock/knowledge.mock";

export interface KnowledgeService {
  search(query: KnowledgeQuery): Promise<KnowledgeSource[]>;
  get(id: string): Promise<KnowledgeSource | null>;
}

export const knowledgeService: KnowledgeService = mockKnowledgeService;
