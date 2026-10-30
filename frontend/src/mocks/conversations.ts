import type { AssistantMessage, Conversation, UserMessage } from "@/types/chat";
import { buildStructuredAnswer } from "./answers";

function exchange(id: string, question: string, at: string): [UserMessage, AssistantMessage] {
  return [
    { id: `${id}-u`, role: "user", content: question, createdAt: at },
    {
      id: `${id}-a`,
      role: "assistant",
      createdAt: at,
      answer: buildStructuredAnswer(question, "en"),
      streamingText: "",
      status: "complete",
      feedback: null,
      error: null,
    },
  ];
}

const mk = (
  id: string,
  title: string,
  at: string,
  question: string,
): Conversation => ({
  id,
  title,
  createdAt: at,
  updatedAt: at,
  countryCode: "IN",
  regionCode: "telangana",
  language: "en",
  messages: exchange(id, question, at),
});

/** Sample history: dates are relative to SAMPLE_NOW (2026-10-31). */
export const seedConversations: Conversation[] = [
  mk("c-deposit", "Security deposit not returned", "2026-10-31T09:10:00+05:30", "My landlord has not returned my deposit after I moved out. What can I do?"),
  mk("c-notice", "Termination notice questions", "2026-10-30T16:20:00+05:30", "My employer terminated me with one day's notice. Is that allowed?"),
  mk("c-refund", "Refund for a defective phone", "2026-10-27T12:00:00+05:30", "I bought a defective product and the seller refuses a refund."),
  mk("c-evict", "Can a landlord ask me to vacate?", "2026-10-20T18:45:00+05:30", "Can my landlord ask me to vacate my flat with 10 days notice?"),
  mk("c-docs", "Which documents should I keep?", "2026-09-28T11:30:00+05:30", "What documents should I keep for a workplace dispute?"),
];
