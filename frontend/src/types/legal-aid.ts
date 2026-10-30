export type LegalAidCategory = "government" | "authority" | "public-resource";

export interface LegalAidOrganization {
  id: string;
  name: string;
  countryCode: string;
  /** Region code the organisation is limited to; null = applies country-wide. */
  regionCode: string | null;
  category: LegalAidCategory;
  description: string;
  eligibility: string;
  services: string[];
  website: string | null;
  phone: string | null;
  /** What was actually checked, and when. Contact details are only included if the check found them. */
  verification: { checkedOn: string; method: string };
}

export interface LegalAidQuery {
  countryCode: string;
  regionCode?: string | null;
  category?: LegalAidCategory | "all";
  text?: string;
}
