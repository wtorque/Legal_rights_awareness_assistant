export type SearchGroup = "Pages" | "Rights" | "Conversations" | "Documents" | "Legal sources" | "Action plans";

export interface SearchResult {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  href: string;
  /** Set for conversations so the assistant opens the right one. */
  conversationId?: string;
}
