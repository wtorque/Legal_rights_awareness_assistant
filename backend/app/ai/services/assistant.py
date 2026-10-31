"""Turns a user question into a streamed explanation plus a parsed, structured answer."""
import re
from collections.abc import AsyncIterator
from dataclasses import dataclass, field

from app.ai.guard import escape_delimiters
from app.ai.prompts.assistant import EXPLANATION, FOLLOW_UPS, NEXT_STEPS, system_prompt
from app.ai.providers.nvidia import ChatMessage, NvidiaChatProvider



@dataclass
class ParsedAnswer:
    explanation: str = ""
    next_steps: list[dict[str, str]] = field(default_factory=list)
    follow_ups: list[str] = field(default_factory=list)


def _bullets(block: str) -> list[str]:
    items = []
    for line in block.splitlines():
        line = line.strip()
        if re.match(r"^([-*•]|\d+[.)])\s+", line):
            items.append(re.sub(r"^([-*•]|\d+[.)])\s+", "", line).strip())
    return items


def parse_answer(text: str) -> ParsedAnswer:
    """Split model output on the section markers. Tolerates missing sections and stray formatting."""
    def section(name: str, after: str | None, before: list[str]) -> str:
        start = text.find(name)
        if start == -1:
            return ""
        start += len(name)
        end = len(text)
        for marker in before:
            idx = text.find(marker, start)
            if idx != -1:
                end = min(end, idx)
        return text[start:end].strip()

    explanation = section(EXPLANATION, None, [NEXT_STEPS, FOLLOW_UPS]) or text.strip()
    steps = []
    for item in _bullets(section(NEXT_STEPS, None, [FOLLOW_UPS])):
        title, _, detail = item.partition("::")
        title, detail = title.strip().strip("*"), detail.strip()
        if title:
            steps.append({"title": title, "detail": detail or title})
    follow_ups = [q.strip().strip("*") for q in _bullets(section(FOLLOW_UPS, None, []))][:3]
    return ParsedAnswer(explanation=explanation, next_steps=steps[:4], follow_ups=follow_ups)


class AssistantService:
    def __init__(self, provider: NvidiaChatProvider) -> None:
        self._provider = provider

    async def answer(
        self,
        *,
        question: str,
        history: list[ChatMessage],
        language: str,
        jurisdiction: str,
        canary: str = "",
        specifics: bool = False,
    ) -> AsyncIterator[tuple[str, str]]:
        """Yield ("delta", text) for the explanation as it streams, then ("full", raw_text) once."""
        messages: list[ChatMessage] = [
            {"role": "system", "content": system_prompt(language=language, jurisdiction=jurisdiction, canary=canary, specifics=specifics)},
            *({"role": t["role"], "content": escape_delimiters(t["content"])} for t in history),
            # Sandwich: the rules are restated after the untrusted text, where models weight them most.
            {"role": "user", "content": f"<user_question>\n{escape_delimiters(question)}\n</user_question>\n\nAnswer only as Aequa, following the rules above and the required format."},
        ]
        raw = ""
        emitted = 0
        header_done = False
        first = True
        async for chunk in self._provider.stream(messages):
            raw += chunk
            # Only the explanation streams live; hold back anything that could be a section marker.
            marker = raw.find(NEXT_STEPS)
            limit = marker if marker != -1 else max(len(raw) - len(NEXT_STEPS) + 1, 0)
            if not header_done:
                head = raw.find(EXPLANATION)
                if head == -1:
                    if limit > len(EXPLANATION) + 4:  # model skipped the header
                        header_done = True
                    else:
                        continue
                else:
                    emitted = head + len(EXPLANATION)
                    header_done = True
            if limit > emitted:
                piece = raw[emitted:limit]
                if first:
                    piece = piece.lstrip()
                if piece:
                    first = False
                    yield "delta", piece
                emitted = limit
        yield "full", raw
