import { API_BASE_URL } from "@/lib/api-config";
import type { ChatStreamEvent, SendMessageRequest } from "@/types/chat";
import type { StructuredAnswer } from "@/types/legal";
import { ServiceError } from "../errors";
import { authHeader } from "./auth-header";
import type { ChatService } from "../chat.service";
import { mockChatService, saveExchange } from "../mock/chat.mock";
import { readSse } from "./sse";

/** Wire shape of the backend `final` event (snake_case). Mirrors backend/app/schemas/assistant.py. */
interface WireAnswer {
  status: "answered" | "refused" | "needs_clarification";
  text: string;
  structured: {
    simple_explanation: string;
    next_steps: { title: string; detail: string }[];
    limitations: string[];
    follow_ups: string[];
  };
}

interface WireError {
  error: { code: string; message: string };
}

function toStructured(wire: WireAnswer, language: string): StructuredAnswer {
  return {
    status: wire.status,
    simpleExplanation: wire.structured.simple_explanation,
    provisions: [],
    rights: [],
    nextSteps: wire.structured.next_steps,
    limitations: wire.structured.limitations,
    sources: [],
    followUps: wire.structured.follow_ups,
    language,
    languageFallback: false,
    origin: "ai-unverified",
  };
}

/**
 * Answers come from the FastAPI backend (SSE). Conversation storage stays in the browser for now:
 * the backend has no database yet, so list/create/rename/delete/feedback reuse the local store.
 */
export const httpChatService: ChatService = {
  ...mockChatService,

  async *sendMessage(request: SendMessageRequest, signal?: AbortSignal): AsyncGenerator<ChatStreamEvent> {
    const conversation = (await mockChatService.listConversations()).find((c) => c.id === request.conversationId);
    // Last few turns give the model context for follow-ups. Excludes the exchange being regenerated.
    const turns: { role: "user" | "assistant"; content: string }[] = (conversation?.messages ?? [])
      .slice(0, request.regenerate ? -2 : undefined)
      .flatMap((m): { role: "user" | "assistant"; content: string }[] =>
        m.role === "user" ? [{ role: "user", content: m.content }] : m.answer ? [{ role: "assistant", content: m.answer.simpleExplanation }] : [],
      )
      .slice(-6);

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/v1/assistant/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream", ...(await authHeader()) },
        body: JSON.stringify({
          question: request.question,
          jurisdiction_code: request.countryCode,
          region_code: request.regionCode,
          language: request.language,
          conversation_id: request.conversationId,
          history: turns,
        }),
        signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      if (error instanceof ServiceError) throw error;
      throw new ServiceError("upstream_unavailable", "Can't reach the Aequa server. Is the backend running?");
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as WireError | null;
      throw new ServiceError("upstream_unavailable", body?.error?.message ?? `Server error (${response.status})`);
    }

    for await (const sse of readSse(response)) {
      const data: unknown = JSON.parse(sse.data);
      if (sse.event === "delta") {
        yield { type: "delta", text: (data as { text: string }).text };
      } else if (sse.event === "final") {
        const answer = toStructured(data as WireAnswer, request.language);
        saveExchange(request, answer);
        yield { type: "final", answer };
        return;
      } else if (sse.event === "error") {
        throw new ServiceError("upstream_unavailable", (data as WireError).error.message);
      }
    }
    throw new ServiceError("upstream_unavailable", "The connection closed before the answer finished.");
  },
};
