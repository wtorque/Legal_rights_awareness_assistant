import type { DataOrigin } from "./common";

export type RightsCategoryId =
  | "employment"
  | "housing"
  | "consumer"
  | "privacy"
  | "family"
  | "education"
  | "criminal-justice"
  | "financial"
  | "healthcare"
  | "disability";

export interface TopicSummary {
  slug: string;
  title: string;
  category: RightsCategoryId;
  summary: string;
}

export interface LearningResource {
  id: string;
  title: string;
  kind: "Guide" | "Explainer" | "Checklist";
  minutes: number;
  description: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  /** ISO timestamp */
  at: string;
  href: string;
}

export interface DashboardOverview {
  origin: DataOrigin;
  stats: { documentsAnalyzed: number; savedResources: number; completedPlans: number };
  recentDocuments: ActivityItem[];
  recentPlans: ActivityItem[];
  savedResources: ActivityItem[];
  featuredTopics: TopicSummary[];
  learning: LearningResource[];
}
