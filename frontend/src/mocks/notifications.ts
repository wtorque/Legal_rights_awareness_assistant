import type { Notification } from "@/types/common";

export const sampleNotifications: Notification[] = [
  {
    id: "n1",
    title: "Document analysis ready",
    body: "Sample Rental Agreement finished analysis. Review the flagged clauses.",
    createdAt: "2026-10-31T08:40:00+05:30",
    kind: "document",
    href: "/documents",
  },
  {
    id: "n2",
    title: "Action plan step due",
    body: "“Gather supporting documents” in your sample plan is marked for this week.",
    createdAt: "2026-10-30T17:10:00+05:30",
    kind: "plan",
    href: "/action-plans",
  },
  {
    id: "n3",
    title: "Prototype notice",
    body: "All content is sample data. Nothing here has been verified against legal sources.",
    createdAt: "2026-10-29T10:00:00+05:30",
    kind: "system",
  },
];
