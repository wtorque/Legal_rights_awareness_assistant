import { create } from "zustand";
import { documentsService } from "@/services/documents.service";
import type { DocumentCategory, DocumentRecord } from "@/types/documents";

type Status = "idle" | "loading" | "ready" | "error";

export interface UploadJob {
  id: string;
  fileName: string;
  sizeBytes: number;
  progress: number;
  state: "uploading" | "done" | "failed";
  error?: string;
}

interface DocumentsState {
  documents: DocumentRecord[];
  status: Status;
  jobs: UploadJob[];
  load: () => Promise<void>;
  upload: (file: File, category: DocumentCategory) => Promise<DocumentRecord | null>;
  remove: (id: string) => Promise<void>;
  dismissJob: (id: string) => void;
  markAnalyzed: (id: string) => void;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  status: "idle",
  jobs: [],

  load: async () => {
    if (get().status === "loading") return;
    set({ status: "loading" });
    try {
      set({ documents: await documentsService.list(), status: "ready" });
    } catch {
      set({ status: "error" });
    }
  },

  upload: async (file, category) => {
    const jobId = `job-${Math.random().toString(36).slice(2, 8)}`;
    const patch = (fn: (j: UploadJob) => UploadJob) => set((s) => ({ jobs: s.jobs.map((j) => (j.id === jobId ? fn(j) : j)) }));
    set((s) => ({
      jobs: [{ id: jobId, fileName: file.name, sizeBytes: file.size, progress: 0, state: "uploading" }, ...s.jobs],
    }));
    try {
      const record = await documentsService.upload(file, {
        category,
        onProgress: (progress) => patch((j) => ({ ...j, progress })),
      });
      patch((j) => ({ ...j, progress: 1, state: "done" }));
      set((s) => ({ documents: [record, ...s.documents] }));
      return record;
    } catch (error) {
      patch((j) => ({ ...j, state: "failed", error: error instanceof Error ? error.message : "Upload failed" }));
      return null;
    }
  },

  remove: async (id) => {
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
    await documentsService.remove(id);
  },

  dismissJob: (id) => set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),

  markAnalyzed: (id) => set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, analyzed: true } : d)) })),
}));
