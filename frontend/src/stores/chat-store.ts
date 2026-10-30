import { create } from "zustand";
import { uid } from "@/lib/mock-storage";
import { chatService } from "@/services/chat.service";
import type { AssistantMessage, ChatMessage, Conversation, MessageFeedback } from "@/types/chat";
import { usePreferencesStore } from "./preferences-store";

type Status = "idle" | "loading" | "ready" | "error";

interface ChatState {
  conversations: Conversation[];
  status: Status;
  activeId: string | null;
  /** True while an answer is streaming for the active conversation. */
  busy: boolean;
  load: () => Promise<void>;
  select: (id: string | null) => void;
  startNew: () => Promise<string>;
  rename: (id: string, title: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  send: (question: string) => Promise<void>;
  regenerate: () => Promise<void>;
  stop: () => void;
  setFeedback: (messageId: string, feedback: MessageFeedback) => Promise<void>;
}

let controller: AbortController | null = null;

function patchConversation(list: Conversation[], id: string, fn: (c: Conversation) => Conversation) {
  return list.map((c) => (c.id === id ? fn(c) : c));
}

function patchMessage(list: Conversation[], convId: string, msgId: string, fn: (m: AssistantMessage) => AssistantMessage) {
  return patchConversation(list, convId, (c) => ({
    ...c,
    messages: c.messages.map((m) => (m.id === msgId && m.role === "assistant" ? fn(m) : m)),
  }));
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  status: "idle",
  activeId: null,
  busy: false,

  load: async () => {
    if (get().status === "loading") return;
    set({ status: "loading" });
    try {
      const conversations = await chatService.listConversations();
      set({ conversations, status: "ready" });
    } catch {
      set({ status: "error" });
    }
  },

  select: (activeId) => set({ activeId }),

  startNew: async () => {
    const prefs = usePreferencesStore.getState();
    const existingEmpty = get().conversations.find((c) => c.messages.length === 0);
    if (existingEmpty) {
      set({ activeId: existingEmpty.id });
      return existingEmpty.id;
    }
    const conversation = await chatService.createConversation({
      countryCode: prefs.country,
      regionCode: prefs.region,
      language: prefs.responseLanguage,
    });
    set((s) => ({ conversations: [conversation, ...s.conversations], activeId: conversation.id }));
    return conversation.id;
  },

  rename: async (id, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    set((s) => ({ conversations: patchConversation(s.conversations, id, (c) => ({ ...c, title: trimmed })) }));
    await chatService.renameConversation(id, trimmed);
  },

  remove: async (id) => {
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      activeId: s.activeId === id ? null : s.activeId,
    }));
    await chatService.deleteConversation(id);
  },

  send: async (question) => {
    const text = question.trim();
    if (!text || get().busy) return;
    let convId = get().activeId;
    if (!convId) convId = await get().startNew();

    const prefs = usePreferencesStore.getState();
    const now = new Date().toISOString();
    const userMessageId = uid("m");
    const assistantMessageId = uid("m");
    const userMessage: ChatMessage = { id: userMessageId, role: "user", content: text, createdAt: now };
    const assistant: AssistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      createdAt: now,
      answer: null,
      streamingText: "",
      status: "streaming",
      feedback: null,
      error: null,
    };
    const id = convId;
    set((s) => ({
      busy: true,
      conversations: patchConversation(s.conversations, id, (c) => ({
        ...c,
        title: c.messages.length === 0 ? (text.length > 48 ? `${text.slice(0, 45)}…` : text) : c.title,
        updatedAt: now,
        messages: [...c.messages, userMessage, assistant],
      })),
    }));
    await run(id, assistantMessageId, { userMessageId, assistantMessageId, question: text, regenerate: false }, prefs);
  },

  regenerate: async () => {
    const { activeId, conversations, busy } = get();
    if (!activeId || busy) return;
    const conv = conversations.find((c) => c.id === activeId);
    const lastUser = [...(conv?.messages ?? [])].reverse().find((m) => m.role === "user");
    if (!conv || !lastUser || lastUser.role !== "user") return;

    const assistantMessageId = uid("m");
    const fresh: AssistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      createdAt: new Date().toISOString(),
      answer: null,
      streamingText: "",
      status: "streaming",
      feedback: null,
      error: null,
    };
    set((s) => ({
      busy: true,
      conversations: patchConversation(s.conversations, activeId, (c) => ({ ...c, messages: [...c.messages.slice(0, -1), fresh] })),
    }));
    await run(activeId, assistantMessageId, { userMessageId: lastUser.id, assistantMessageId, question: lastUser.content, regenerate: true }, usePreferencesStore.getState());
  },

  stop: () => controller?.abort(),

  setFeedback: async (messageId, feedback) => {
    const { activeId } = get();
    if (!activeId) return;
    set((s) => ({ conversations: patchMessage(s.conversations, activeId, messageId, (m) => ({ ...m, feedback })) }));
    await chatService.setFeedback(activeId, messageId, feedback);
  },
}));

async function run(
  convId: string,
  assistantId: string,
  ids: { userMessageId: string; assistantMessageId: string; question: string; regenerate: boolean },
  prefs: ReturnType<typeof usePreferencesStore.getState>,
) {
  const set = useChatStore.setState;
  controller = new AbortController();
  try {
    const stream = chatService.sendMessage(
      {
        conversationId: convId,
        ...ids,
        countryCode: prefs.country,
        regionCode: prefs.region,
        language: prefs.responseLanguage,
      },
      controller.signal,
    );
    for await (const event of stream) {
      if (event.type === "delta") {
        set((s) => ({ conversations: patchMessage(s.conversations, convId, assistantId, (m) => ({ ...m, streamingText: m.streamingText + event.text })) }));
      } else if (event.type === "final") {
        set((s) => ({ conversations: patchMessage(s.conversations, convId, assistantId, (m) => ({ ...m, answer: event.answer, streamingText: "", status: "complete" })) }));
      } else {
        set((s) => ({ conversations: patchMessage(s.conversations, convId, assistantId, (m) => ({ ...m, status: "error", error: event.message })) }));
      }
    }
  } catch (error) {
    const stopped = error instanceof DOMException && error.name === "AbortError";
    set((s) => ({
      conversations: patchMessage(s.conversations, convId, assistantId, (m) =>
        // A stopped answer keeps whatever text streamed so far.
        stopped && m.streamingText ? { ...m, status: "complete" } : { ...m, status: "error", error: error instanceof Error ? error.message : "Something went wrong." },
      ),
    }));
  } finally {
    controller = null;
    set({ busy: false });
  }
}
