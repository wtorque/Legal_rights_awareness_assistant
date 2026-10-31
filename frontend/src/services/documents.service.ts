import type {
  DocumentAnalysis,
  DocumentCategory,
  DocumentComparison,
  DocumentContent,
  DocumentRecord,
} from "@/types/documents";
import { isLiveBackend } from "@/lib/api-config";
import { httpDocumentsService } from "./http/documents.http";
import { mockDocumentsService } from "./mock/documents.mock";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = { "application/pdf": [".pdf"] } as const;

/** Document intelligence. Live mode talks to /api/v1/documents; without a backend URL the mock keeps files in the browser. */
export interface DocumentsService {
  list(): Promise<DocumentRecord[]>;
  upload(
    file: File,
    options: { category: DocumentCategory; onProgress: (fraction: number) => void; signal?: AbortSignal },
  ): Promise<DocumentRecord>;
  /** Extracted page text. Null in mock mode for user files, which are previewed natively. */
  getContent(id: string): Promise<DocumentContent | null>;
  /** Object URL of the original PDF, if available. The caller revokes it. */
  getFileUrl(id: string): Promise<string | null>;
  analyze(id: string): Promise<DocumentAnalysis>;
  compare(leftId: string, rightId: string): Promise<DocumentComparison>;
  remove(id: string): Promise<void>;
}

export const documentsService: DocumentsService = isLiveBackend ? httpDocumentsService : mockDocumentsService;
