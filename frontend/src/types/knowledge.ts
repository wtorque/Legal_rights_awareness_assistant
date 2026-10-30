import type { DataOrigin } from "./common";

export type SourceCategory = "legislation" | "regulation" | "guidance" | "legal-aid" | "court";

export interface KnowledgeSection {
  label: string;
  summary: string;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  authority: string;
  countryCode: string;
  /** Free-text jurisdiction label, e.g. "Sample region (fictional)". */
  jurisdiction: string;
  category: SourceCategory;
  docType: "Act" | "Rules" | "Guide" | "Notice" | "Portal";
  publicationDate: string | null;
  effectiveDate: string | null;
  /** ISO date; null means never verified. */
  lastVerified: string | null;
  officialUrl: string | null;
  description: string;
  sections: KnowledgeSection[];
  origin: DataOrigin;
}

export interface KnowledgeQuery {
  text?: string;
  countryCode?: string | "all";
  category?: SourceCategory | "all";
  docType?: KnowledgeSource["docType"] | "all";
}
