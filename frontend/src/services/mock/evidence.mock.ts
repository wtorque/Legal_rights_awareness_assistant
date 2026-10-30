import { delay } from "@/lib/mock-storage";
import { sampleGraph } from "@/mocks/evidence";
import type { EvidenceService } from "../evidence.service";

export const mockEvidenceService: EvidenceService = {
  async getGraph() {
    await delay(500);
    return sampleGraph;
  },
};
