import type { DataOrigin } from "./common";

/**
 * UI-side source model. The backend contract's `Source` (snake_case, verified-only) is mapped
 * into this shape at the service boundary. `origin: "sample"` means fixture content that must
 * never be presented as a verified citation.
 */
export interface SourceReference {
  id: string;
  documentTitle: string;
  sectionLabel: string;
  authority: string;
  jurisdictionCode: string;
  quote: string;
  url: string | null;
  /** ISO date the source was verified; null for sample data. */
  verifiedAt: string | null;
  origin: DataOrigin;
}

export interface LegalProvision {
  id: string;
  title: string;
  summary: string;
  sourceId: string;
}

export interface RightPoint {
  title: string;
  detail: string;
}

export interface ActionStepSuggestion {
  title: string;
  detail: string;
}

/**
 * Structured assistant answer. PROPOSED extension: the current DATA_CONTRACTS `Answer` has only
 * `text` + `sources`; the section breakdown below needs a contract change before backend work.
 */
export interface StructuredAnswer {
  status: "answered" | "refused" | "needs_clarification";
  simpleExplanation: string;
  provisions: LegalProvision[];
  rights: RightPoint[];
  nextSteps: ActionStepSuggestion[];
  limitations: string[];
  sources: SourceReference[];
  followUps: string[];
  /** Language the explanation is written in. */
  language: string;
  /** Set when the sample explanation was not available in the requested language. */
  languageFallback: boolean;
  origin: DataOrigin;
}
