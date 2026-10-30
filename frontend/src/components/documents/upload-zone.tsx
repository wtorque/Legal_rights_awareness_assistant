"use client";

import { CircleAlert, CircleCheck, FileUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES } from "@/services/documents.service";
import { useDocumentsStore } from "@/stores/documents-store";
import type { DocumentCategory } from "@/types/documents";
import { categoryLabels } from "./categories";

function rejectionMessage(r: FileRejection) {
  const code = r.errors[0]?.code;
  if (code === "file-too-large") return `${r.file.name} is larger than ${formatBytes(MAX_UPLOAD_BYTES)}.`;
  if (code === "file-invalid-type") return `${r.file.name} isn't a PDF.`;
  return r.errors[0]?.message ?? "File rejected";
}

export function UploadZone() {
  const router = useRouter();
  const { upload, jobs, dismissJob } = useDocumentsStore();
  const [category, setCategory] = useState<DocumentCategory>("housing");

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxSize: MAX_UPLOAD_BYTES,
    multiple: true,
    noClick: true,
    onDropRejected: (rejections) => rejections.forEach((r) => toast.error(rejectionMessage(r))),
    onDrop: async (files) => {
      for (const file of files) {
        const record = await upload(file, category);
        if (record) {
          toast.success(`${file.name} added`, {
            description: "Stored in this browser only.",
            action: { label: "Open", onClick: () => router.push(`/documents/${record.id}`) },
          });
        }
      }
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border bg-card/40",
        )}
      >
        <input {...getInputProps()} aria-label="Choose PDF files" />
        <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
          <FileUp className="size-5" aria-hidden />
        </span>
        <div>
          <p className="font-medium">{isDragActive ? "Drop to add" : "Drag a PDF here"}</p>
          <p className="mt-1 text-sm text-muted-foreground">PDF only, up to {formatBytes(MAX_UPLOAD_BYTES)}. Files stay in your browser in this prototype.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Select aria-label="Document category" value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)} className="h-10 w-44 rounded-full">
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button onClick={open}>Choose files</Button>
        </div>
      </div>

      {jobs.length > 0 && (
        <ul className="space-y-2" aria-label="Upload history">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-3">
              {job.state === "done" ? (
                <CircleCheck className="size-5 shrink-0 text-primary" aria-hidden />
              ) : job.state === "failed" ? (
                <CircleAlert className="size-5 shrink-0 text-destructive" aria-hidden />
              ) : (
                <FileUp className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{job.fileName}</p>
                {job.state === "uploading" ? (
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={Math.round(job.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${job.fileName}`}>
                    <div className="h-full origin-left rounded-full bg-primary transition-transform duration-200" style={{ transform: `scaleX(${job.progress})` }} />
                  </div>
                ) : (
                  <p className={cn("text-xs", job.state === "failed" ? "text-destructive" : "text-muted-foreground")}>
                    {job.state === "failed" ? job.error : `${formatBytes(job.sizeBytes)} · added`}
                  </p>
                )}
              </div>
              {job.state !== "uploading" && (
                <Button variant="ghost" size="icon-sm" onClick={() => dismissJob(job.id)} aria-label={`Dismiss ${job.fileName}`}>
                  <X />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
