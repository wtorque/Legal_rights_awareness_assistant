"""Clause-level comparison of two analysed documents. Pure text matching; no judgment about which version is better."""
import re
from dataclasses import dataclass
from difflib import SequenceMatcher

# Titles that look alike, or bodies that are mostly alike, are treated as the same clause.
_TITLE_MATCH = 0.85
_BODY_MATCH = 0.6


@dataclass(frozen=True)
class ClauseText:
    title: str
    text: str


@dataclass(frozen=True)
class Change:
    type: str  # "added" | "removed" | "modified"
    title: str
    before: str | None
    after: str | None


def _norm(value: str) -> str:
    return re.sub(r"\s+", " ", value.lower()).strip()


def _ratio(a: str, b: str) -> float:
    return SequenceMatcher(None, _norm(a), _norm(b), autojunk=False).ratio()


def compare_clauses(left: list[ClauseText], right: list[ClauseText]) -> list[Change]:
    changes: list[Change] = []
    unmatched = list(range(len(right)))
    for lc in left:
        best, best_score = None, 0.0
        for idx in unmatched:
            rc = right[idx]
            title_score, body_score = _ratio(lc.title, rc.title), _ratio(lc.text, rc.text)
            score = max(title_score if title_score >= _TITLE_MATCH else 0.0, body_score if body_score >= _BODY_MATCH else 0.0)
            if score > best_score:
                best, best_score = idx, score
        if best is None:
            changes.append(Change("removed", lc.title, lc.text, None))
            continue
        unmatched.remove(best)
        rc = right[best]
        if _norm(lc.text) != _norm(rc.text):
            changes.append(Change("modified", lc.title, lc.text, rc.text))
    changes.extend(Change("added", right[i].title, None, right[i].text) for i in unmatched)
    return changes
