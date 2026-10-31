export type EmergencyCategory = "emergency" | "women" | "child" | "cyber" | "legal-aid";

export interface EmergencyContact {
  id: string;
  category: EmergencyCategory;
  name: string;
  /** Digits to dial. Shown and used in a tel: link exactly as stored. */
  number: string;
  description: string;
  /** Caveat shown with the number when availability differs by place. */
  note: string | null;
  officialUrl: string;
  /** Official page that supports the number, and the date it was checked. */
  verification: { checkedOn: string; source: string };
}
