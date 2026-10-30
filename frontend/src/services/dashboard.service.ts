import type { DashboardOverview } from "@/types/dashboard";
import { mockDashboardService } from "./mock/dashboard.mock";

export interface DashboardService {
  getOverview(): Promise<DashboardOverview>;
}

export const dashboardService: DashboardService = mockDashboardService;
