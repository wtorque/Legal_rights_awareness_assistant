"""Server-side validation of what the model wrote. The model is told not to cite law, but that is a request, not a control.

Only constitutional Articles that exist in the local catalogue can be confirmed. Every other reference (statute
sections, case names) is reported as unverified, and every URL is removed because no official link list exists yet.
"""
import re
from dataclasses import dataclass, field

from app.legal.catalogue.repository import CatalogueRepository

_ARTICLE = re.compile(r"\bArticles?\s+(\d+[A-Z]{0,2})\b(?:\s*\(\s*\w+\s*\))*", re.I)
_SECTION = re.compile(r"\b(?:Section|Sec\.|Rule|Order)\s+\d+[A-Za-z]?(?:\(\w+\))*(?:\s+of\s+the\s+[A-Z][A-Za-z ,'&\-()]{2,80}?\b(?:Act|Code|Rules)(?:,?\s+(?:of\s+)?\d{4})?)?")
_ACT = re.compile(r"\b(?:the\s+)?[A-Z][A-Za-z&'\-]*(?:\s+[A-Z][A-Za-z&'\-]*){0,6}\s+(?:Act|Code),?\s+(?:of\s+)?(?:1[89]|20)\d{2}\b")
_CASE = re.compile(r"\b[A-Z][\w.&'\-]*(?:\s+[A-Z][\w.&'\-]*)*\s+v(?:s|\.)?\s+[A-Z][\w.&'\-]*(?:\s+[A-Z][\w.&'\-]*)*")
_URL = re.compile(r"(?i)\b(?:https?://|www\.)\S+")


@dataclass
class Validation:
    text: str
    verified: list[dict[str, str]] = field(default_factory=list)
    unverified: list[str] = field(default_factory=list)


def validate_output(text: str, catalogue: CatalogueRepository, jurisdiction_id: str = "IN") -> Validation:
    result = Validation(text=_URL.sub("[link removed]", text))
    known = {p.locator.lower(): p for p in catalogue.provisions.values() if p.jurisdiction_id == jurisdiction_id}
    seen: set[str] = set()
    for m in _ARTICLE.finditer(result.text):
        locator = f"article {m.group(1)}".lower()
        provision = known.get(locator)
        if provision is None:
            if m.group(0) not in result.unverified:
                result.unverified.append(m.group(0))
        elif locator not in seen:
            seen.add(locator)
            result.verified.append({"locator": provision.locator, "heading": provision.heading or "", "provision_id": provision.id})
    for pattern in (_SECTION, _ACT, _CASE):
        for m in pattern.finditer(result.text):
            ref = re.sub(r"\s+", " ", m.group(0)).strip()
            if not any(ref in known_ref for known_ref in result.unverified):
                result.unverified.append(ref)
    return result
