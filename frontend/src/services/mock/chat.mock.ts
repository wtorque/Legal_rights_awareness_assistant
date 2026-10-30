import { buildStructuredAnswer } from "@/mocks/answers";
import { seedConversations } from "@/mocks/conversations";
import { delay, readJson, uid, writeJson } from "@/lib/mock-storage";
import type { ChatService } from "../chat.service";
import { ServiceError } from "../errors";
import type { AssistantMessage, Conversation, SendMessageRequest } from "@/types/chat";
import type { StructuredAnswer } from "@/types/legal";

const KEY = "aequa-mock-conversations";

let cache: Conversation[] | null = null;

function db(): Conversation[] {
  cache ??= readJson<Conversation[]>(KEY, seedConversations);
  return cache;
}

function save(next: Conversation[]) {
  cache = next;
  writeJson(KEY, next);
}

function find(id: string): Conversation {
  const found = db().find((c) => c.id === id);
  if (!found) throw new ServiceError("not_found", "Conversation not found");
  return found;
}

function titleFrom(question: string): string {
  const trimmed = question.trim().replace(/\s+/g, " ");
  return trimmed.length > 48 ? `${trimmed.slice(0, 45)}…` : trimmed;
}

/** Persists a finished exchange (or replaces the last answer when regenerating). Shared with the HTTP service. */
export function saveExchange(request: SendMessageRequest, answer: StructuredAnswer) {
  const conversation = find(request.conversationId);
  const now = new Date().toISOString();
  const assistant: AssistantMessage = {
    id: request.assistantMessageId,
    role: "assistant",
    createdAt: now,
    answer,
    streamingText: "",
    status: "complete",
    feedback: null,
    error: null,
  };
  save(
    db().map((c) => {
      if (c.id !== conversation.id) return c;
      const history = request.regenerate
        ? c.messages.slice(0, -1)
        : [...c.messages, { id: request.userMessageId, role: "user" as const, content: request.question, createdAt: now }];
      return {
        ...c,
        title: c.messages.length === 0 ? titleFrom(request.question) : c.title,
        updatedAt: now,
        messages: [...history, assistant],
      };
    }),
  );
}

export const mockChatService: ChatService = {
  async listConversations() {
    await delay(450);
    return [...db()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async createConversation({ countryCode, regionCode, language }) {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: uid("c"),
      title: "New conversation",
      createdAt: now,
      updatedAt: now,
      countryCode,
      regionCode,
      language,
      messages: [],
    };
    save([conversation, ...db()]);
    return conversation;
  },

  async renameConversation(id, title) {
    find(id);
    save(db().map((c) => (c.id === id ? { ...c, title } : c)));
  },

  async deleteConversation(id) {
    find(id);
    save(db().filter((c) => c.id !== id));
  },

  async *sendMessage(request, signal) {
    find(request.conversationId);
    const answer = buildStructuredAnswer(request.question, request.language);

    await delay(700, signal);
    const words = answer.simpleExplanation.split(/(\s+)/);
    for (let i = 0; i < words.length; i += 3) {
      yield { type: "delta", text: words.slice(i, i + 3).join("") };
      await delay(45, signal);
    }
    await delay(250, signal);
    yield { type: "final", answer };

    saveExchange(request, answer);
  },

  async setFeedback(conversationId, messageId, feedback) {
    save(
      db().map((c) =>
        c.id === conversationId
          ? { ...c, messages: c.messages.map((m) => (m.id === messageId && m.role === "assistant" ? { ...m, feedback } : m)) }
          : c,
      ),
    );
  },
};
