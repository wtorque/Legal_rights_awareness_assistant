import type { ChatStreamEvent, Conversation, MessageFeedback, SendMessageRequest } from "@/types/chat";
import { isLiveBackend } from "@/lib/api-config";
import { httpChatService } from "./http/chat.http";
import { mockChatService } from "./mock/chat.mock";

/**
 * Chat + conversations. The UI only talks to this interface; swap the implementation for an
 * HTTP/SSE client when the FastAPI backend exists (see docs/integration/FRONTEND_BACKEND.md).
 */
export interface ChatService {
  listConversations(): Promise<Conversation[]>;
  createConversation(input: { countryCode: string; regionCode: string | null; language: string }): Promise<Conversation>;
  renameConversation(id: string, title: string): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  /** Persists the exchange and streams the assistant answer. Abort via the signal. */
  sendMessage(request: SendMessageRequest, signal?: AbortSignal): AsyncGenerator<ChatStreamEvent>;
  setFeedback(conversationId: string, messageId: string, feedback: MessageFeedback): Promise<void>;
}

export const chatService: ChatService = isLiveBackend ? httpChatService : mockChatService;
