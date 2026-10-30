import { isLiveBackend } from "@/lib/api-config";
import type { Coverage, RightDetail, RightsPage, RightsQuery } from "@/types/catalogue";
import { httpCatalogueService } from "./http/catalogue.http";
import { mockCatalogueService } from "./mock/catalogue.mock";

export interface CatalogueService {
  searchRights(query: RightsQuery): Promise<RightsPage>;
  /** Null when the id does not exist. */
  getRight(id: string): Promise<RightDetail | null>;
  getCoverage(): Promise<Coverage>;
}

export const catalogueService: CatalogueService = isLiveBackend ? httpCatalogueService : mockCatalogueService;
