import { sampleOverview } from "@/mocks/dashboard";
import { delay } from "@/lib/mock-storage";
import type { DashboardService } from "../dashboard.service";

export const mockDashboardService: DashboardService = {
  async getOverview() {
    await delay(500);
    return sampleOverview;
  },
};
