import { API_BASE_URL } from "@/lib/api-config";
import { camelize } from "@/lib/camelize";
import type { DocumentAnalysis, DocumentComparison, DocumentContent, DocumentRecord } from "@/types/documents";
import type { DocumentsService } from "../documents.service";
import { ServiceError } from "../errors";
import { authHeader } from "./auth-header";

const BASE = `${API_BASE_URL}/api/v1/documents`;

interface ErrorEnvelope {
  error?: { code?: string; message?: string };
}

function toServiceError(status: number, body: ErrorEnvelope | null): ServiceError {
  const message = body?.error?.message ?? `Server error (${status})`;
  if (status === 404) return new ServiceError("not_found", message);
  if (status === 400 || status === 413 || status === 422) return new ServiceError("validation_error", message);
  return new ServiceError("upstream_unavailable", message);
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers: { ...init?.headers, ...(await authHeader()) } });
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError("upstream_unavailable", "Can't reach the Aequa server. Is the backend running?");
  }
  if (!res.ok) throw toServiceError(res.status, (await res.json().catch(() => null)) as ErrorEnvelope | null);
  return res;
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  return camelize<T>(await (await request(path, init)).json());
}

/** XHR, not fetch: fetch cannot report upload progress. */
async function uploadWithProgress(file: File, category: string, onProgress: (fraction: number) => void, signal?: AbortSignal): Promise<DocumentRecord> {
  const auth = await authHeader();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/upload`);
    xhr.setRequestHeader("Authorization", auth.Authorization);
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(camelize<DocumentRecord>(xhr.response));
      else reject(toServiceError(xhr.status, xhr.response as ErrorEnvelope | null));
    };
    xhr.onerror = () => reject(new ServiceError("upstream_unavailable", "Can't reach the Aequa server. Is the backend running?"));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    xhr.send(form);
  });
}

export const httpDocumentsService: DocumentsService = {
  list: () => json<DocumentRecord[]>(""),
  upload: (file, { category, onProgress, signal }) => uploadWithProgress(file, category, onProgress, signal),
  getContent: (id) => json<DocumentContent>(`/${encodeURIComponent(id)}/content`),

  /** The PDF is fetched as a blob so it can be previewed without exposing it to the page origin via an iframe src. */
  async getFileUrl(id) {
    const blob = await (await request(`/${encodeURIComponent(id)}/file`)).blob();
    return URL.createObjectURL(blob);
  },

  analyze: (id) => json<DocumentAnalysis>(`/${encodeURIComponent(id)}/analysis`, { method: "POST" }),
  compare: (leftId, rightId) =>
    json<DocumentComparison>("/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ left_id: leftId, right_id: rightId }),
    }),
  async remove(id) {
    await request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
