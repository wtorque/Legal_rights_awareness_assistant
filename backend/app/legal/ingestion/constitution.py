"""Extracts Part III (Fundamental Rights) of the Constitution of India from the official PDF text.

Pure functions over page text, so they can be tested with fictional layouts. Nothing here knows the law:
it only splits, labels and links text that is already in the source. Editorial choices (which articles
are individual rights, how they are kinded) live in explicit tables at the top and are flagged for review.
"""
import re
from dataclasses import dataclass, field

# Articles of Part III in print order. Taken from the Part's own sequence, including repealed numbers.
PART_III_ARTICLES = [
    "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "21A", "22", "23", "24", "25", "26", "27",
    "28", "29", "30", "31", "31A", "31B", "31C", "32", "32A", "33", "34", "35",
]

# EDITORIAL: articles that confer an individual right (as opposed to definitions, saving clauses and
# limits on the rights). Reviewer must confirm. Everything else is stored as a provision only.
RIGHT_ARTICLES = ["14", "15", "16", "17", "18", "19", "20", "21", "21A", "22", "23", "24", "25", "26", "27",
                  "28", "29", "30", "32"]
# EDITORIAL: articles whose subject is a procedure or remedy rather than a substantive protection.
PROCEDURAL_ARTICLES = {"22", "32"}

KNOWN_GROUP_HEADINGS = [
    "General",
    "Right to Equality",
    "Right to Freedom",
    "Right against Exploitation",
    "Right to Freedom of Religion",
    "Cultural and Educational Rights",
    "Right to Property",
    "Saving of Certain Laws",
    "Right to Constitutional Remedies",
]

_FOOTNOTE_RULE = re.compile(r"^\s*_{10,}\s*$", re.M)
_PAGE_NO = re.compile(r"^\s*\d{1,3}\s*$")
_FOOTNOTE_START = re.compile(r"^(\d{1,2})\.\s+(.*)$")


def _ws(phrase: str) -> str:
    """Regex for a phrase that tolerates irregular spacing between words."""
    return r"\s+".join(re.escape(w) for w in phrase.split())


# Footnote 2 on the page of Article 31: the sub-heading "Right to Property" was omitted by the 44th Amendment.
GROUP_OVERRIDES: dict[str, str | None] = {"31": None}


@dataclass
class PageText:
    pdf_page: int  # 1-based
    body: str
    footnotes: dict[str, str] = field(default_factory=dict)


@dataclass
class ParsedArticle:
    number: str
    heading: str | None
    text: str
    group_heading: str | None
    pages: list[int]
    amendments: list[tuple[str, str]]  # (marker, footnote text)
    repealed: bool


_RUNNING_HEADER = re.compile(r"THE\s+CONSTITUTION\s+OF\s+INDIA\s*\(Part[^)]*\)\s*\n?\s*\d{0,3}[ \t]*")


def split_page(pdf_page: int, raw: str) -> PageText:
    """Separate the running text from the footnote block (everything after the underscore rule)."""
    raw = _RUNNING_HEADER.sub("", raw)
    parts = _FOOTNOTE_RULE.split(raw, maxsplit=1)
    body_lines = [ln for ln in parts[0].splitlines()]
    # Drop a bare page number printed at the top of the page.
    while body_lines and (not body_lines[0].strip() or _PAGE_NO.match(body_lines[0])):
        body_lines.pop(0)
    notes: dict[str, str] = {}
    if len(parts) > 1:
        current: str | None = None
        for line in parts[1].splitlines():
            m = _FOOTNOTE_START.match(line.strip())
            if m:
                current = m.group(1)
                notes[current] = m.group(2).strip()
            elif current and line.strip():
                notes[current] += " " + line.strip()
    return PageText(pdf_page=pdf_page, body="\n".join(body_lines), footnotes=notes)


def reflow(text: str) -> str:
    """Join hard line wraps but keep each numbered or lettered clause on its own line."""
    out: list[str] = []
    for line in text.splitlines():
        s = line.strip()
        if not s:
            continue
        if out and not re.match(r"^\(([0-9]+[A-Z]?|[a-z]{1,3}|[ivx]+)\)\s", s) and not re.match(r"^\d{0,2}\[\(", s):
            out[-1] += " " + s
        else:
            out.append(s)
    return "\n".join(re.sub(r"\s+", " ", ln) for ln in out)


def _heading_and_body(chunk: str) -> tuple[str | None, str]:
    flat = re.sub(r"\s+", " ", chunk).strip()
    m = re.match(r"^(?P<h>.+?)\.\s*[—–-]\s*(?P<b>.*)$", flat, re.S)
    if m and len(m.group("h")) < 300:
        return m.group("h").strip().strip("[]").strip(), m.group("b").strip()
    return None, flat


def parse_articles(pages: list[PageText], numbers: list[str] = PART_III_ARTICLES) -> list[ParsedArticle]:
    """Split the Part III running text into articles, in the order given by `numbers`."""
    joined = ""
    page_starts: list[tuple[int, int, PageText]] = []
    for p in pages:
        start = len(joined)
        joined += p.body + "\n"
        page_starts.append((start, len(joined), p))

    # Locate each article start: the number at the start of a line followed by whitespace, in sequence.
    positions: list[tuple[str, int]] = []
    cursor = 0
    for n in numbers:
        # A footnote marker may be glued to the number: "2[21A." or, for lettered articles, "132A.".
        prefix = r"(?:\d{1,2}\[)?" if not n[-1].isalpha() else r"(?:\d{1,2}\[|\d(?=\d))?"
        m = re.compile(rf"(?m)^{prefix}{re.escape(n)}\.\s+").search(joined, cursor)
        if not m:
            raise ValueError(f"Article {n} not found in text after offset {cursor}")
        positions.append((n, m.start()))
        cursor = m.end()

    # Group headings: standalone lines that match the known official headings.
    heading_marks: list[tuple[int, str]] = []
    for h in KNOWN_GROUP_HEADINGS:
        for m in re.finditer(rf"(?m)^(?:\d{{1,2}}\[)?{_ws(h)}\]?\s*$", joined):
            heading_marks.append((m.start(), h))
    heading_marks.sort()

    articles: list[ParsedArticle] = []
    for i, (num, start) in enumerate(positions):
        end = positions[i + 1][1] if i + 1 < len(positions) else len(joined)
        span = joined[start:end]
        # Group headings printed at the end of the span head the NEXT article (and may sit on the next page).
        trimmed = span.rstrip()
        for h in KNOWN_GROUP_HEADINGS:
            trimmed = re.sub(rf"(?:\n(?:\d{{1,2}}\[)?{_ws(h)}\]?)+$", "", trimmed)
        end = start + len(trimmed)
        span = trimmed
        raw = re.sub(rf"^(?:\d{{1,2}}\[|\d(?=\d))?{re.escape(num)}\.\s+", "", span, count=1)
        # strip standalone group-heading lines inside the span (they head the following article)
        for h in KNOWN_GROUP_HEADINGS:
            raw = re.sub(rf"(?m)^(?:\d{{1,2}}\[)?{_ws(h)}\]?\s*$", "", raw)
        heading, body = _heading_and_body(raw)
        group = None
        for pos, h in heading_marks:
            if pos < start:
                group = h
        if num in GROUP_OVERRIDES:
            group = GROUP_OVERRIDES[num]
        involved = [p for (s, e, p) in page_starts if s < end and e > start]
        amendments: list[tuple[str, str]] = []
        for ps, pe, p in page_starts:
            if ps >= end or pe <= start:
                continue
            segment = joined[max(start, ps):min(end, pe)]
            for h in KNOWN_GROUP_HEADINGS:  # a group heading's own footnote marker belongs to the next article
                segment = re.sub(rf"(?m)^(?:\d{{1,2}}\[)?{_ws(h)}\]?\s*$", "", segment)
            # Footnote numbers restart on every page, so markers are matched against that page's notes only.
            for marker in sorted(set(re.findall(r"(?<![\w(])(\d{1,2})\[", segment)), key=int):
                if marker in p.footnotes:
                    amendments.append((marker, p.footnotes[marker]))
        repealed = bool(re.match(r"^\[?\s*(Repealed|Omitted)\b", body, re.I)) or bool(re.search(r"\bRep\. by\b", body[:200]))
        articles.append(
            ParsedArticle(
                number=num,
                heading=heading,
                text=reflow(span_to_text(raw, heading)),
                group_heading=group,
                pages=[p.pdf_page for p in involved],
                amendments=amendments,
                repealed=repealed,
            )
        )
    return articles


def span_to_text(raw: str, heading: str | None) -> str:
    """Return the article text after its marginal heading, preserving clause line breaks."""
    if heading is None:
        return raw
    m = re.search(r"\.\s*[—–-]", raw)
    return raw[m.end():] if m else raw


def split_clause_rights(article_text: str, clause_no: str) -> list[tuple[str, str, bool]]:
    """Return [(letter, text, omitted)] for the lettered sub-clauses of clause `(clause_no)`.

    Used where one clause lists several distinct entitlements. `omitted` marks sub-clauses the official
    text prints as omitted ("* * *").
    """
    lines = article_text.splitlines()
    out: list[tuple[str, str, bool]] = []
    inside = False
    for line in lines:
        if re.match(rf"^(?:\d{{1,2}}\[)?\({re.escape(clause_no)}\)", line):
            inside = True
            continue
        if inside and re.match(r"^(?:\d{1,2}\[)?\(\d+[A-Z]?\)", line):
            break
        if inside:
            m = re.match(r"^(?:\d{1,2}\[)?\(([a-z])\)\s*(.*)$", line)
            if m:
                body = m.group(2).strip()
                out.append((m.group(1), body, bool(re.search(r"\*\s*\*", body))))
    return out


def effective_date_from_commencement(text: str) -> str | None:
    """Parse the commencement date out of the commencement article's own text."""
    m = re.search(r"come into force on the (\w+(?:-\w+)?) day of (\w+), (\d{4})", text)
    if not m:
        return None
    ordinals = {"twenty-sixth": 26}
    day = ordinals.get(m.group(1).lower())
    months = {"January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, "July": 7, "August": 8,
              "September": 9, "October": 10, "November": 11, "December": 12}
    month = months.get(m.group(2))
    if not day or not month:
        return None
    return f"{m.group(3)}-{month:02d}-{day:02d}"
