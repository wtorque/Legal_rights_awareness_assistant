"""PDF validation and text extraction. Uploaded files are untrusted: validate by content, never execute or render."""
import re
from dataclasses import dataclass

import pymupdf

from app.core.exceptions import ValidationFailed

MAX_PAGES = 200
MAX_TEXT_CHARS = 1_000_000
# A scanned page yields almost no text; below this average per page we treat the file as image-only.
MIN_CHARS_PER_PAGE = 20
# Active content markers. A rights-awareness reader never needs them, so such files are refused.
_ACTIVE_CONTENT = re.compile(rb"/(JavaScript|JS|Launch|EmbeddedFile|OpenAction|AA)\b")
_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


@dataclass(frozen=True)
class ExtractedPage:
    number: int
    paragraphs: list[str]


@dataclass(frozen=True)
class Extraction:
    pages: list[ExtractedPage]
    needs_ocr: bool


_LINE_HEADING = re.compile(r"^\s*(?:\d+(?:\.\d+)*[.)]\s|\([a-z0-9]{1,3}\)\s|(?:clause|article|section)\s+\d+)", re.I)


def _paragraphs(blocks: list[tuple]) -> list[str]:
    """One paragraph per text block, further split where a line starts like a numbered clause."""
    out: list[str] = []
    for block in blocks:
        if block[6] != 0:  # image block
            continue
        current: list[str] = []
        for line in _CONTROL.sub("", block[4]).replace("\r", "").splitlines():
            line = line.strip()
            if not line:
                continue
            if current and _LINE_HEADING.match(line):
                out.append(" ".join(current))
                current = []
            current.append(line)
        if current:
            out.append(" ".join(current))
    return out


def extract_pdf(data: bytes) -> Extraction:
    if not data.startswith(b"%PDF-"):
        raise ValidationFailed("That file is not a PDF")
    if _ACTIVE_CONTENT.search(data):
        raise ValidationFailed("PDFs with scripts, attachments or launch actions are not accepted")
    try:
        doc = pymupdf.open(stream=data, filetype="pdf")
    except (RuntimeError, ValueError) as exc:
        raise ValidationFailed("That PDF could not be read") from exc
    with doc:
        if doc.needs_pass or doc.is_encrypted:
            raise ValidationFailed("Password-protected PDFs are not supported")
        if doc.page_count == 0:
            raise ValidationFailed("That PDF has no pages")
        if doc.page_count > MAX_PAGES:
            raise ValidationFailed(f"PDFs longer than {MAX_PAGES} pages are not supported")
        pages: list[ExtractedPage] = []
        total = 0
        for index in range(doc.page_count):
            try:
                blocks = doc[index].get_text("blocks", sort=True)
            except (RuntimeError, ValueError) as exc:
                raise ValidationFailed("That PDF could not be read") from exc
            total += sum(len(b[4]) for b in blocks)
            if total > MAX_TEXT_CHARS:
                raise ValidationFailed("That PDF contains too much text to process")
            pages.append(ExtractedPage(number=index + 1, paragraphs=_paragraphs(blocks)))
    chars = sum(len(p) for page in pages for p in page.paragraphs)
    return Extraction(pages=pages, needs_ocr=chars < MIN_CHARS_PER_PAGE * len(pages))
