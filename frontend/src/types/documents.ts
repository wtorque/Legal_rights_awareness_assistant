import type { DataOrigin } from "./common";

export type DocumentCategory = "housing" | "employment" | "consumer" | "financial" | "other";
export type DocumentStatus = "uploading" | "processing" | "ready" | "failed";

export interface DocumentRecord {
  id: string;
  name: string;
  category: DocumentCategory;
  pages: number;
  sizeBytes: number;
  uploadedAt: string;
  status: DocumentStatus;
  /** "sample" = bundled fixture with fixture text; "upload" = a file the user chose in this session. */
  origin: DataOrigin | "upload";
  analyzed: boolean;
  /** Live backend only. */
  detectedType?: string | null;
  /** True when the PDF has no text layer; OCR is not available, so it cannot be analysed. */
  needsOcr?: boolean;
  warnings?: string[];
  failureReason?: string | null;
  history?: DocumentEvent[];
}

export interface DocumentEvent {
  at: string;
  kind: "uploaded" | "processed" | "failed" | "analyzed";
  detail: string;
}

export interface DocumentParagraph {
  id: string;
  text: string;
  /** Clause this paragraph belongs to, for highlight linking. */
  clauseId?: string;
}

export interface DocumentPage {
  number: number;
  paragraphs: DocumentParagraph[];
}

export interface DocumentContent {
  documentId: string;
  pages: DocumentPage[];
}

/** Neutral labels only — never a legal judgment. */
export type ClauseFlag = "attention" | "ambiguous" | "obligation" | "missing";
export type ClauseImportance = "high" | "medium" | "low";

export interface Clause {
  id: string;
  title: string;
  originalText: string;
  /** Null when no plain-language explanation exists; the original wording is shown instead. */
  simplified: string | null;
  category: string;
  importance: ClauseImportance;
  flag: ClauseFlag | null;
  page: number;
  sourceId: string | null;
}

export interface KeyDate {
  label: string;
  value: string;
}

export interface DocumentAnalysis {
  documentId: string;
  summary: string;
  clauses: Clause[];
  obligations: string[];
  missingInformation: string[];
  keyDates: KeyDate[];
  lawyerQuestions: string[];
  origin: DataOrigin | "extracted";
  documentType?: string;
  /** Citations exactly as written in the document; never verified against an official source. */
  legalReferences?: LegalReference[];
  generatedBy?: "rules";
  /** True when a user-uploaded file is paired with a demonstration analysis (the file was not read). */
  demonstrationOnly: boolean;
}

export interface LegalReference {
  text: string;
  page: number;
  verified: boolean;
}

export interface ClauseChange {
  type: "added" | "removed" | "modified";
  title: string;
  before: string | null;
  after: string | null;
}

export interface DocumentComparison {
  leftId: string;
  rightId: string;
  changes: ClauseChange[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
}
