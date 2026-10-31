"""Post-generation checks. Everything the model wrote is untrusted until it passes here.

Order: leak and persona check on the raw output, then per sentence: remove URLs, drop unconfirmed legal references,
drop unsupported numbers, guarantees and authority claims. What is dropped is never rewritten.
"""
from dataclasses import dataclass, field

from app.ai.citations import validate_output
from app.ai.grounding import printable, sentence_problem, split_sentences, user_numbers
from app.ai.messages import abstain_text
from app.ai.output_guard import leak_or_shift
from app.ai.services.assistant import ParsedAnswer
from app.legal.catalogue.repository import CatalogueRepository


@dataclass
class Checked:
    explanation: str = ""
    next_steps: list[dict[str, str]] = field(default_factory=list)
    follow_ups: list[str] = field(default_factory=list)
    verified: list[dict[str, str]] = field(default_factory=list)
    removed_references: list[str] = field(default_factory=list)
    removals: int = 0
    abstained: bool = False
    blocked: str | None = None


class _Cleaner:
    def __init__(self, catalogue: CatalogueRepository, allowed: set[str], context: str) -> None:
        self.catalogue, self.allowed, self.context = catalogue, allowed, context
        self.verified: dict[str, dict[str, str]] = {}
        self.removed_references: list[str] = []
        self.removals = 0

    def text(self, raw: str) -> str:
        kept = []
        for sentence in split_sentences(printable(raw)):
            checked = validate_output(sentence, self.catalogue)
            if checked.unverified:
                self.removed_references += [r for r in checked.unverified if r not in self.removed_references]
                self.removals += 1
                continue
            if sentence_problem(checked.text, self.allowed, self.context):
                self.removals += 1
                continue
            for v in checked.verified:
                self.verified.setdefault(v["locator"], v)
            kept.append(checked.text)
        return " ".join(kept)


def check_answer(parsed: ParsedAnswer, raw: str, *, canary: str, question: str, history_user_turns: list[str],
                 language: str, catalogue: CatalogueRepository) -> Checked:
    blocked = leak_or_shift(raw, canary)
    if blocked:
        return Checked(blocked=blocked)
    cleaner = _Cleaner(catalogue, user_numbers(question, *history_user_turns), " ".join([question, *history_user_turns]))
    explanation = cleaner.text(parsed.explanation)
    steps = []
    for step in parsed.next_steps:
        before = cleaner.removals
        title, detail = cleaner.text(step["title"]), cleaner.text(step["detail"])
        if cleaner.removals != before or not title or not detail:
            cleaner.removals += int(cleaner.removals == before)  # an emptied step still counts as a removal
            continue
        steps.append({"title": title, "detail": detail})
    follow_ups = []
    for q in parsed.follow_ups:
        before = cleaner.removals
        cleaned = cleaner.text(q)
        if cleaner.removals == before and cleaned:
            follow_ups.append(cleaned)
    result = Checked(
        explanation=explanation, next_steps=steps, follow_ups=follow_ups, verified=list(cleaner.verified.values()),
        removed_references=cleaner.removed_references, removals=cleaner.removals,
    )
    if not explanation:
        result.explanation, result.abstained = abstain_text(language), True
    return result
