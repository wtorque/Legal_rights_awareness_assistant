/** Marks where content came from so the UI can always label it. "ai-unverified" = model output with no verified sources. */
export type DataOrigin = "sample" | "verified" | "ai-unverified";

export interface Notification {
  id: string;
  title: string;
  body: string;
  /** ISO timestamp */
  createdAt: string;
  kind: "info" | "document" | "plan" | "system";
  href?: string;
}

export interface UserProfile {
  name: string;
  initials: string;
  email: string;
}
