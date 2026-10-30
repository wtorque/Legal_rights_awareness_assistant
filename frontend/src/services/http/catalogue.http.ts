import { API_BASE_URL } from "@/lib/api-config";
import { camelize } from "@/lib/camelize";
import type { Coverage, RightDetail, RightsPage, RightsQuery } from "@/types/catalogue";
import { ServiceError } from "../errors";
import type { CatalogueService } from "../catalogue.service";

async function get(path: string, params?: Record<string, string | number | undefined>): Promise<Response> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v !== undefined && v !== "") qs.set(k, String(v));
  try {
    return await fetch(`${API_BASE_URL}/api/v1/catalogue${path}${qs.size ? `?${qs}` : ""}`, { headers: { Accept: "application/json" } });
  } catch {
    throw new ServiceError("upstream_unavailable", "Can't reach the Aequa server. Is the backend running?");
  }
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new ServiceError(res.status === 404 ? "not_found" : "upstream_unavailable", `Server error (${res.status})`);
  return camelize<T>(await res.json());
}

export const httpCatalogueService: CatalogueService = {
  async searchRights(q: RightsQuery) {
    const res = await get("/rights", {
      q: q.text?.trim(), domain: q.domain, category: q.category, kind: q.kind, jurisdiction: q.jurisdiction,
      verification: q.verification, status: q.status, limit: q.limit, offset: q.offset,
    });
    return json<RightsPage>(res);
  },

  async getRight(id) {
    const res = await get(`/rights/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    return json<RightDetail>(res);
  },

  async getCoverage() {
    return json<Coverage>(await get("/coverage"));
  },
};
