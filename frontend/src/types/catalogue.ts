/** Legal rights catalogue (UI types). Wire format is snake_case; services convert. */

export type RightKind = "enforceable_right" | "constitutional_protection" | "procedural_right" | "scheme_benefit";
export type VerificationStatus = "unverified" | "machine_extracted" | "human_verified";
export type RepealStatus = "in_force" | "partially_repealed" | "repealed" | "unknown";

export interface Verification {
  status: VerificationStatus;
  checkedBy: string | null;
  checkedAt: string | null;
  notes: string | null;
  needsReview: boolean;
}

export interface Provenance {
  sourceId: string;
  sourceUrl: string;
  retrievedAt: string;
  contentSha256: string;
  locator: string;
}

export interface Ref {
  id: string;
  name: string;
}

export interface RightSummary {
  id: string;
  title: string;
  kind: RightKind;
  status: RepealStatus;
  domain: Ref;
  category: Ref;
  jurisdiction: Ref;
  documentTitle: string;
  locators: string[];
  /** Verbatim start of the official text. */
  excerpt: string;
  verification: Verification;
  effectiveDate: string | null;
  /** True for fixture content served by the mock service. */
  sample?: boolean;
}

export interface FacetOption {
  id: string;
  label: string;
  count: number;
}

export type FacetName = "domains" | "categories" | "kinds" | "jurisdictions" | "verification" | "status";

export interface RightsPage {
  items: RightSummary[];
  total: number;
  nextOffset: number | null;
  facets: Record<FacetName, FacetOption[]>;
}

export interface RightsQuery {
  text?: string;
  domain?: string;
  category?: string;
  kind?: RightKind;
  jurisdiction?: string;
  verification?: VerificationStatus;
  status?: RepealStatus;
  limit?: number;
  offset?: number;
}

export interface Amendment {
  marker: string;
  text: string;
}

export interface ProvisionDetail {
  provision: {
    id: string;
    locator: string;
    number: string;
    heading: string | null;
    text: string;
    part: string | null;
    groupHeading: string | null;
    status: RepealStatus;
    amendments: Amendment[];
    provenance: Provenance;
    verification: Verification;
  };
  refs: { provisionId: string; clause: string | null; quote: string }[];
}

export interface RightDetail {
  right: {
    id: string;
    title: string;
    titleBasis: string;
    kind: RightKind;
    kindBasis: string;
    status: RepealStatus;
    effectiveDate: string | null;
    plainLanguage: string | null;
    provenance: Provenance;
    verification: Verification;
  };
  domain: { id: string; name: string };
  category: { id: string; name: string; nameBasis: string };
  jurisdiction: { id: string; name: string; kind: string };
  document: {
    id: string;
    title: string;
    docType: string;
    officialUrl: string;
    effectiveDate: string | null;
    effectiveDateBasis: string | null;
    editionNote: string | null;
    repealStatus: RepealStatus;
  };
  source: { id: string; name: string; publisher: string; trustLevel: string; identityEvidence: string; verification: Verification };
  provisions: ProvisionDetail[];
  authorities: { id: string; name: string; evidenceProvisionId: string }[];
  remedies: { id: string; title: string; authorityIds: string[]; provisionRefs: { provisionId: string; clause: string | null; quote: string }[] }[];
  related: RightSummary[];
  kindExplanation: string;
  caveats: string[];
  sample?: boolean;
}

export interface Coverage {
  complete: false;
  auditStatus: string;
  statement: string;
  counts: Record<string, number>;
  verification: Record<string, number>;
  kinds: Record<string, number>;
  documents: { id: string; title: string; docType: string; jurisdictionId: string; effectiveDate: string | null; repealStatus: RepealStatus; editionNote: string | null }[];
  jurisdictions: { id: string; name: string; kind: string; documents: number; rights: number }[];
  sample?: boolean;
}
