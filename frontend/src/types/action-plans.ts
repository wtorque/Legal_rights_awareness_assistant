import type { RightsCategoryId } from "./dashboard";

export interface PlanStep {
  id: string;
  title: string;
  detail: string;
  done: boolean;
  note: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  custom: boolean;
}

export interface Authority {
  name: string;
  role: string;
  url: string | null;
}

export interface PlanDate {
  label: string;
  value: string;
  /** False for every sample date. Only verified dates may be shown as requirements. */
  verified: boolean;
}

export interface ActionPlan {
  id: string;
  title: string;
  category: RightsCategoryId;
  situation: string;
  countryCode: string;
  regionCode: string | null;
  createdAt: string;
  updatedAt: string;
  steps: PlanStep[];
  checklist: ChecklistItem[];
  authorities: Authority[];
  resources: { label: string; url: string | null }[];
  importantDates: PlanDate[];
  origin: "sample" | "user";
}

export interface NewPlanInput {
  title: string;
  category: RightsCategoryId;
  situation: string;
  countryCode: string;
  regionCode: string | null;
}

export type PlanStatus = "active" | "completed";
