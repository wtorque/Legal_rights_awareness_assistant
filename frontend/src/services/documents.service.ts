import type {
  DocumentAnalysis,
  DocumentCategory,
  DocumentComparison,
  DocumentContent,
  DocumentRecord,
} from "@/types/documents";
import { mockDocumentsService } from "./mock/documents.mock";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = { "application/pdf": [".pdf"] } as const;

/** Document intelligence. Real implementation will POST multipart to /api/v1/documents and poll. */
export interface DocumentsService {
  list(): Promise<DocumentRecord[]>;
  upload(
    file: File,
    options: { category: DocumentCategory; onProgress: (fraction: number) => void; signal?: AbortSignal },
  ): Promise<DocumentRecord>;
  /** Page text for fixture documents; null for user files, which are previewed natively. */
  getContent(id: string): Promise<DocumentContent | null>;
  /** Browser-local object URL of an uploaded file, if any. */
  getFileUrl(id: string): string | null;
  analyze(id: string): Promise<DocumentAnalysis>;
  compare(leftId: string, rightId: string): Promise<DocumentComparison>;
  remove(id: string): Promise<void>;
}

export const documentsService: DocumentsService = mockDocumentsService;
