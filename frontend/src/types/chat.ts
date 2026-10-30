import type { StructuredAnswer } from "./legal";

export type MessageFeedback = "up" | "down" | null;

export interface UserMessage {
  id: string;
  role: "user";
  content: string;
  createdAt: string;
}

export interface AssistantMessage {
  id: string;
  role: "assistant";
  createdAt: string;
  /** Null while the first tokens have not arrived. */
  answer: StructuredAnswer | null;
  /** Streamed text so far; replaced by `answer.simpleExplanation` when complete. */
  streamingText: string;
  status: "streaming" | "complete" | "error";
  feedback: MessageFeedback;
  /** User-facing reason when status is "error". */
  error: string | null;
}

export type ChatMessage = UserMessage | AssistantMessage;

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  countryCode: string;
  regionCode: string | null;
  language: string;
  messages: ChatMessage[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
}

export interface SendMessageRequest {
  conversationId: string;
  /** Client-generated ids so optimistic UI and persisted messages agree. */
  userMessageId: string;
  assistantMessageId: string;
  /** Replace the last assistant answer instead of appending a new exchange. */
  regenerate?: boolean;
  question: string;
  countryCode: string;
  regionCode: string | null;
  language: string;
}

/** Mirrors the proposed SSE contract (delta … final) in typed form. */
export type ChatStreamEvent =
  | { type: "delta"; text: string }
  | { type: "final"; answer: StructuredAnswer }
  | { type: "error"; message: string };
