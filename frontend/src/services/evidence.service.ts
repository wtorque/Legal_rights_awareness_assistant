import type { EvidenceGraphData } from "@/types/evidence";
import { mockEvidenceService } from "./mock/evidence.mock";

export interface EvidenceService {
  getGraph(): Promise<EvidenceGraphData>;
}

export const evidenceService: EvidenceService = mockEvidenceService;
