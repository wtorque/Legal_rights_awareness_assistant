import { delay, readJson, uid, writeJson } from "@/lib/mock-storage";
import { sampleAnalyses, sampleContent, sampleDocuments } from "@/mocks/documents";
import type { ClauseChange, DocumentRecord } from "@/types/documents";
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES, type DocumentsService } from "../documents.service";
import { ServiceError } from "../errors";

const KEY = "aequa-mock-uploads";

/** Object URLs live for the tab session only; records (metadata) persist. */
const fileUrls = new Map<string, string>();
let uploads: DocumentRecord[] | null = null;

function loadUploads() {
  uploads ??= readJson<DocumentRecord[]>(KEY, []);
  return uploads;
}

function saveUploads(next: DocumentRecord[]) {
  uploads = next;
  writeJson(KEY, next);
}

function paragraphsByClause(id: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const page of sampleContent[id]?.pages ?? []) {
    for (const p of page.paragraphs) if (p.clauseId) map.set(p.clauseId, p.text);
  }
  return map;
}

function clauseTitle(clauseId: string): string {
  for (const analysis of Object.values(sampleAnalyses)) {
    const found = analysis.clauses.find((c) => c.id === clauseId);
    if (found) return found.title;
  }
  return clauseId;
}

export const mockDocumentsService: DocumentsService = {
  async list() {
    await delay(400);
    return [...loadUploads(), ...sampleDocuments].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  },

  async upload(file, { category, onProgress, signal }) {
    const accepted = Object.keys(ACCEPTED_TYPES);
    if (!accepted.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new ServiceError("validation_error", "Only PDF files are supported.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new ServiceError("validation_error", "That file is larger than the 10 MB limit.");
    }
    // Simulated transfer: the file never leaves the browser.
    for (let i = 1; i <= 10; i++) {
      await delay(120, signal);
      onProgress(i / 10);
    }
    const record: DocumentRecord = {
      id: uid("up"),
      name: file.name,
      category,
      pages: 0,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      status: "ready",
      origin: "upload",
      analyzed: false,
    };
    fileUrls.set(record.id, URL.createObjectURL(file));
    saveUploads([record, ...loadUploads()]);
    return record;
  },

  async getContent(id) {
    await delay(250);
    return sampleContent[id] ?? null;
  },

  getFileUrl: (id) => fileUrls.get(id) ?? null,

  async analyze(id) {
    // Deliberately slow so the scanning animation is visible.
    await delay(2600);
    const sample = sampleAnalyses[id];
    if (sample) return sample;
    const upload = loadUploads().find((d) => d.id === id);
    if (!upload) throw new ServiceError("not_found", "Document not found");
    saveUploads(loadUploads().map((d) => (d.id === id ? { ...d, analyzed: true } : d)));
    return { ...sampleAnalyses["doc-rental"], documentId: id, demonstrationOnly: true };
  },

  async compare(leftId, rightId) {
    await delay(700);
    const left = paragraphsByClause(leftId);
    const right = paragraphsByClause(rightId);
    if (left.size === 0 || right.size === 0) {
      throw new ServiceError("validation_error", "Comparison is only available for the sample documents.");
    }
    const changes: ClauseChange[] = [];
    for (const [id, before] of left) {
      const after = right.get(id);
      if (after === undefined) changes.push({ type: "removed", title: clauseTitle(id), before, after: null });
      else if (after !== before) changes.push({ type: "modified", title: clauseTitle(id), before, after });
    }
    for (const [id, after] of right) {
      if (!left.has(id)) changes.push({ type: "added", title: clauseTitle(id), before: null, after });
    }
    return { leftId, rightId, changes };
  },

  async remove(id) {
    const url = fileUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    fileUrls.delete(id);
    saveUploads(loadUploads().filter((d) => d.id !== id));
  },
};
