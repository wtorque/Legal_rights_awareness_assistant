import { beforeEach, describe, expect, it } from "vitest";
import { useChatStore } from "./chat-store";

beforeEach(() => {
  useChatStore.setState({ conversations: [], status: "idle", activeId: null, busy: false });
});

describe("chat store with the mock service", () => {
  it("loads seeded conversations newest first", async () => {
    await useChatStore.getState().load();
    const { conversations, status } = useChatStore.getState();
    expect(status).toBe("ready");
    expect(conversations.length).toBeGreaterThan(0);
    const dates = conversations.map((c) => c.updatedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("streams an answer: sample-labelled, structured, with sources that are never verified", async () => {
    await useChatStore.getState().load();
    await useChatStore.getState().startNew();
    await useChatStore.getState().send("My landlord has not returned my deposit");
    const { conversations, activeId, busy } = useChatStore.getState();
    const conv = conversations.find((c) => c.id === activeId)!;
    const reply = conv.messages.at(-1);
    expect(busy).toBe(false);
    expect(conv.title).toContain("landlord");
    expect(reply?.role).toBe("assistant");
    if (reply?.role !== "assistant") return;
    expect(reply.status).toBe("complete");
    expect(reply.answer?.origin).toBe("sample");
    expect(reply.answer?.sources.length).toBeGreaterThan(0);
    expect(reply.answer?.sources.every((s) => s.origin === "sample" && s.verifiedAt === null)).toBe(true);
  }, 15_000);

  it("renames and removes a conversation", async () => {
    await useChatStore.getState().load();
    const id = useChatStore.getState().conversations[0].id;
    await useChatStore.getState().rename(id, "  My title  ");
    expect(useChatStore.getState().conversations.find((c) => c.id === id)?.title).toBe("My title");
    await useChatStore.getState().remove(id);
    expect(useChatStore.getState().conversations.find((c) => c.id === id)).toBeUndefined();
  });

  it("ignores blank messages", async () => {
    await useChatStore.getState().load();
    await useChatStore.getState().send("   ");
    expect(useChatStore.getState().busy).toBe(false);
  });
});
