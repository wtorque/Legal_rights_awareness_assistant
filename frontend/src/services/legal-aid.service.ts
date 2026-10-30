import type { LegalAidOrganization, LegalAidQuery } from "@/types/legal-aid";
import { mockLegalAidService } from "./mock/legal-aid.mock";

export interface LegalAidService {
  search(query: LegalAidQuery): Promise<LegalAidOrganization[]>;
}

export const legalAidService: LegalAidService = mockLegalAidService;
