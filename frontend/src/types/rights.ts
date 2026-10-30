import type { LegalProvision } from "./legal";
import type { RightsCategoryId } from "./dashboard";

export interface RightsCategory {
  id: RightsCategoryId;
  name: string;
  description: string;
}

export interface OfficialLink {
  label: string;
  url: string | null;
  /** True only when the Aequa team has checked the link and its content. */
  verified: boolean;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface RightsTopic {
  slug: string;
  title: string;
  category: RightsCategoryId;
  overview: string;
  simpleExplanation: string;
  commonSituations: string[];
  provisions: LegalProvision[];
  faqs: Faq[];
  officialLinks: OfficialLink[];
  related: string[];
  /** Country codes the (sample) topic is framed for. */
  countries: string[];
}

export interface RightsQuery {
  text?: string;
  category?: RightsCategoryId | "all";
  countryCode?: string;
}
