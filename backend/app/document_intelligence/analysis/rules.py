"""Deterministic, explainable document analysis. No model is involved and nothing is inferred beyond keywords.

Labels are reading aids ("worth a closer look"), never legal judgments. Legal references are reported exactly as
written in the document and are never verified or completed here.
"""
import re
from collections import Counter
from dataclasses import dataclass

MAX_CLAUSES = 80

Pages = list[tuple[int, list[tuple[str, str]]]]  # [(page_number, [(paragraph_id, text)])]

_HEADING = re.compile(
    r"^\s*(?:(?:clause|article|section|schedule)\s+\d+[A-Za-z]?\b|\d+(?:\.\d+)*[.)]\s|\([a-z0-9]{1,3}\)\s|[IVX]{1,6}[.)]\s)",
    re.IGNORECASE,
)
_SHOUT = re.compile(r"^[A-Z0-9][A-Z0-9 ,&/'()\-:.]{3,70}$")

_CATEGORIES: dict[str, tuple[str, ...]] = {
    "Payment": ("rent", "payment", "pay ", "fee", "salary", "wages", "amount", "price", "invoice", "interest", "emi", "instalment"),
    "Deposit": ("deposit", "advance", "refundable"),
    "Term and renewal": ("term of", "period of", "renew", "extension", "commence", "expire", "duration"),
    "Termination": ("terminat", "notice period", "vacate", "cancel", "resign", "dismiss", "evict"),
    "Penalties": ("penalty", "penalties", "fine", "forfeit", "liquidated damages", "late fee", "default"),
    "Liability": ("liable", "liability", "indemnif", "damages", "compensat", "responsib"),
    "Confidentiality": ("confidential", "non-disclosure", "proprietary"),
    "Disputes": ("arbitrat", "jurisdiction", "governing law", "court", "dispute", "mediation"),
    "Maintenance": ("repair", "maintenance", "utilities", "upkeep"),
    "Notices": ("notice", "written intimation", "communicat"),
}

_OBLIGATION = re.compile(r"\b(shall|must|is required to|are required to|agrees? to|undertakes? to|will be responsible|obliged to)\b", re.I)
_ATTENTION = re.compile(
    r"\b(non[- ]?refundable|forfeit\w*|sole discretion|without (?:any )?(?:prior )?notice|indemnif\w+|waive\w*|irrevocabl\w+|"
    r"liquidated damages|penalt\w+|automatic(?:ally)? (?:renew|terminat)\w*|at (?:its|his|her|their) own risk|no (?:liability|responsibility))\b",
    re.I,
)
_AMBIGUOUS = re.compile(r"\b(reasonable|as may be (?:decided|determined|required)|from time to time|and/or|etc\.?|such other|if any|appropriate|satisfactory)\b", re.I)

_DOC_TYPES: dict[str, tuple[str, ...]] = {
    "Rental or lease agreement": ("tenant", "landlord", "lessee", "lessor", "rent", "premises"),
    "Employment document": ("employee", "employer", "salary", "probation", "designation", "appointment"),
    "Loan or financial agreement": ("borrower", "lender", "loan", "emi", "interest rate", "principal"),
    "Consumer or purchase document": ("warranty", "purchase", "seller", "buyer", "refund", "invoice", "goods"),
    "Notice or letter": ("hereby notified", "legal notice", "notice is hereby", "you are required", "show cause"),
}

_REFERENCE = re.compile(
    r"\b(?:Section|Sec\.|Article|Rule|Order)\s+\d+[A-Za-z]?(?:\(\w+\))*"
    r"(?:\s+of\s+the\s+[A-Z][A-Za-z ,'&\-()]{2,80}?\b(?:Act|Code|Constitution|Rules|Order)(?:,?\s+(?:of\s+)?\d{4})?)?",
)
_MONTHS = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec"
_DATE = re.compile(
    rf"\b(?:\d{{1,2}}(?:st|nd|rd|th)?\s+(?:{_MONTHS})[a-z]*\.?,?\s+\d{{4}}|(?:{_MONTHS})[a-z]*\.?\s+\d{{1,2}}(?:st|nd|rd|th)?,?\s+\d{{4}}|\d{{1,2}}[/.-]\d{{1,2}}[/.-]\d{{2,4}})\b",
    re.I,
)

# Expected topics. Absence is reported as "not found by keyword search", never as a legal defect.
_EXPECTED = (
    ("termination or notice terms", ("terminat", "notice period", "vacate")),
    ("which court or law governs disputes", ("governing law", "jurisdiction", "arbitrat", "court")),
    ("signatures or witnesses", ("signature", "signed", "witness", "executed")),
)


@dataclass
class ClauseDraft:
    id: str
    title: str
    text: str
    page: int
    paragraph_ids: list[str]
    category: str = "General"
    importance: str = "low"
    flag: str | None = None


@dataclass
class AnalysisDraft:
    document_type: str
    clauses: list[ClauseDraft]
    obligations: list[str]
    missing_information: list[str]
    key_dates: list[dict[str, str]]
    legal_references: list[dict[str, object]]
    lawyer_questions: list[str]
    summary: str


def _title(text: str) -> str:
    body = re.sub(r"^\s*(?:\d+(?:\.\d+)*[.)]?|\([a-z0-9]{1,3}\)|[IVX]{1,6}[.)])\s*", "", text)
    head = re.split(r"(?<=[.:;])\s", body, maxsplit=1)[0].strip(" .:-")
    return (head[:77] + "…") if len(head) > 80 else head or "Untitled clause"


def segment(pages: Pages) -> list[ClauseDraft]:
    """A heading-like paragraph starts a new clause; other paragraphs continue the current one."""
    drafts: list[ClauseDraft] = []
    current: ClauseDraft | None = None
    for number, paragraphs in pages:
        for pid, text in paragraphs:
            starts = bool(_HEADING.match(text)) or (bool(_SHOUT.match(text)) and len(text) < 70)
            if current is None or starts:
                current = ClauseDraft(id=f"c{len(drafts) + 1}", title=_title(text), text=text, page=number, paragraph_ids=[pid])
                drafts.append(current)
            else:
                current.text += " " + text
                current.paragraph_ids.append(pid)
    # No headings at all collapses everything into one clause; fall back to one clause per substantial paragraph.
    if len(drafts) <= 1:
        drafts = []
        for number, paragraphs in pages:
            for pid, text in paragraphs:
                if len(text) >= 40:
                    drafts.append(ClauseDraft(id=f"c{len(drafts) + 1}", title=_title(text), text=text, page=number, paragraph_ids=[pid]))
    return drafts[:MAX_CLAUSES]


def _best(lexicon: dict[str, tuple[str, ...]], text: str, minimum: int, default: str) -> str:
    lowered = text.lower()
    scores = {name: sum(lowered.count(k) for k in keys) for name, keys in lexicon.items()}
    name, score = max(scores.items(), key=lambda kv: kv[1])
    return name if score >= minimum else default


def _label(clause: ClauseDraft) -> None:
    clause.category = _best(_CATEGORIES, clause.text, 1, "General")
    if _ATTENTION.search(clause.text):
        clause.flag, clause.importance = "attention", "high"
    elif _AMBIGUOUS.search(clause.text):
        clause.flag, clause.importance = "ambiguous", "medium"
    elif _OBLIGATION.search(clause.text):
        clause.flag, clause.importance = "obligation", "medium"
    elif clause.category in {"Payment", "Deposit", "Termination", "Penalties", "Liability"}:
        clause.importance = "medium"


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.;])\s+", text) if s.strip()]


def _key_dates(text: str) -> list[dict[str, str]]:
    seen: set[str] = set()
    found: list[dict[str, str]] = []
    for m in _DATE.finditer(text):
        value = m.group(0)
        if value in seen:
            continue
        seen.add(value)
        context = re.sub(r"\s+", " ", text[max(0, m.start() - 48): m.start()]).strip()
        label = " ".join(context.split()[-5:]).strip(" ,:;-") or "Date mentioned"
        found.append({"label": label[:60], "value": value})
        if len(found) >= 12:
            break
    return found


def _references(pages: Pages) -> list[dict[str, object]]:
    seen: set[str] = set()
    out: list[dict[str, object]] = []
    for number, paragraphs in pages:
        for _, text in paragraphs:
            for m in _REFERENCE.finditer(text):
                ref = re.sub(r"\s+", " ", m.group(0)).strip()
                if ref.lower() not in seen:
                    seen.add(ref.lower())
                    out.append({"text": ref, "page": number})
    return out[:30]


def _missing(text: str, has_dates: bool) -> list[str]:
    lowered = text.lower()
    gaps = [label for label, keys in _EXPECTED if not any(k in lowered for k in keys)]
    if not has_dates:
        gaps.append("any date")
    return [f"No mention of {g} was found by keyword search. It may be worded differently or be missing." for g in gaps]


def analyze(pages: Pages) -> AnalysisDraft:
    clauses = segment(pages)
    for clause in clauses:
        _label(clause)
    full_text = "\n".join(t for _, ps in pages for _, t in ps)
    dates = _key_dates(full_text)
    obligations = [s for c in clauses for s in _sentences(c.text) if _OBLIGATION.search(s)]
    flags = Counter(c.flag for c in clauses if c.flag)
    n, p = len(clauses), len(pages)
    summary = (
        f"Read {p} page{'s' if p != 1 else ''} and found {n} clause{'s' if n != 1 else ''}. "
        f"{flags['attention']} worth a closer look, {flags['ambiguous']} with loose wording, {flags['obligation']} stating a duty. "
        "This summary is produced by keyword rules, not by a lawyer or an AI model."
    )
    questions = [f"What does the “{c.title}” clause mean for me in practice, and can it be changed?" for c in clauses if c.flag == "attention"][:4]
    questions += [f"Can the wording of “{c.title}” be made more specific?" for c in clauses if c.flag == "ambiguous"][:2]
    questions.append("Is there anything in this document I should negotiate before signing or replying?")
    return AnalysisDraft(
        document_type=_best(_DOC_TYPES, full_text, 3, "Unclassified document"),
        clauses=clauses,
        obligations=obligations[:10],
        missing_information=_missing(full_text, bool(dates)),
        key_dates=dates,
        legal_references=_references(pages),
        lawyer_questions=questions,
        summary=summary,
    )
