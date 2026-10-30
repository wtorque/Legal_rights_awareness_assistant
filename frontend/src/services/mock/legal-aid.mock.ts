import { delay } from "@/lib/mock-storage";
import { legalAidOrganizations } from "@/mocks/legal-aid";
import type { LegalAidService } from "../legal-aid.service";

export const mockLegalAidService: LegalAidService = {
  async search({ countryCode, regionCode, category, text }) {
    await delay(300);
    const q = text?.trim().toLowerCase();
    return legalAidOrganizations.filter(
      (o) =>
        o.countryCode === countryCode &&
        (!regionCode || o.regionCode === null || o.regionCode === regionCode) &&
        (!category || category === "all" || o.category === category) &&
        (!q || `${o.name} ${o.description} ${o.services.join(" ")}`.toLowerCase().includes(q)),
    );
  },
};
