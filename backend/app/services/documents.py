"""Document use cases: validate, extract, store, analyse, compare, delete. No HTTP concerns."""
import re
import uuid
from datetime import UTC, datetime
from pathlib import Path

from starlette.concurrency import run_in_threadpool

from app.core.exceptions import BadRequest, ValidationFailed
from app.core.logging import get_logger
from app.document_intelligence.analysis.rules import analyze
from app.document_intelligence.comparison.clauses import ClauseText, compare_clauses
from app.document_intelligence.extraction.pdf import extract_pdf
from app.document_intelligence.safety import find_injection_attempts
from app.repositories.documents import DocumentRepository
from app.schemas.documents import (
    Category, Clause, ClauseChange, DocumentAnalysis, DocumentComparison, DocumentContent, DocumentEvent,
    DocumentRecord, EventKind, KeyDate, LegalReference, Page, Paragraph, StoredDocument,
)

log = get_logger("documents")
_CONTROL = re.compile(r"[\x00-\x1f\x7f]")
MAX_NAME = 120


def clean_name(raw: str | None) -> str:
    """Display name only. It is never used to build a path."""
    name = _CONTROL.sub("", (raw or "").replace("\\", "/").rsplit("/", 1)[-1]).strip()
    if not name.lower().endswith(".pdf"):
        raise ValidationFailed("Only PDF files are supported")
    return name[:MAX_NAME]


def _event(kind: EventKind, detail: str) -> DocumentEvent:
    return DocumentEvent(at=datetime.now(UTC), kind=kind, detail=detail)


def _page_inputs(pages: list[Page]) -> list[tuple[int, list[tuple[str, str]]]]:
    return [(p.number, [(para.id, para.text) for para in p.paragraphs]) for p in pages]


class DocumentService:
    def __init__(self, repo: DocumentRepository, max_upload_bytes: int) -> None:
        self._repo = repo
        self._max_bytes = max_upload_bytes

    async def upload(self, *, name: str | None, data: bytes, category: Category) -> DocumentRecord:
        display = clean_name(name)
        if not data:
            raise ValidationFailed("That file is empty")
        if len(data) > self._max_bytes:
            raise ValidationFailed(f"That file is larger than {self._max_bytes // (1024 * 1024)} MB")
        extraction = await run_in_threadpool(extract_pdf, data)
        pages = [
            Page(number=p.number, paragraphs=[Paragraph(id=f"p{p.number}-{i + 1}", text=t) for i, t in enumerate(p.paragraphs)])
            for p in extraction.pages
        ]
        text = "\n".join(para.text for page in pages for para in page.paragraphs)
        warnings = [f"This document {label}. Its text was treated as data and was not followed." for label in find_injection_attempts(text)]
        if extraction.needs_ocr:
            warnings.append("This PDF has no readable text (probably a scan). Text extraction and analysis need OCR, which is not available yet.")
        record = DocumentRecord(
            id=uuid.uuid4().hex, name=display, category=category, pages=len(pages), size_bytes=len(data),
            uploaded_at=datetime.now(UTC), status="ready", needs_ocr=extraction.needs_ocr, warnings=warnings,
            history=[_event("uploaded", f"{len(data)} bytes received"), _event("processed", f"{len(pages)} pages read")],
        )
        await run_in_threadpool(self._repo.save_pdf, record.id, data)
        await run_in_threadpool(self._repo.save, StoredDocument(record=record, pages=pages))
        log.info("document_uploaded", document_id=record.id, pages=record.pages, needs_ocr=record.needs_ocr)
        return record

    async def list(self) -> list[DocumentRecord]:
        return [d.record for d in await run_in_threadpool(self._repo.list)]

    async def get(self, document_id: str) -> DocumentRecord:
        return (await run_in_threadpool(self._repo.get, document_id)).record

    async def content(self, document_id: str) -> DocumentContent:
        doc = await run_in_threadpool(self._repo.get, document_id)
        links = {pid: c.id for c in (doc.analysis.clauses if doc.analysis else []) for pid in c.paragraph_ids}
        pages = [Page(number=p.number, paragraphs=[Paragraph(id=q.id, text=q.text, clause_id=links.get(q.id)) for q in p.paragraphs]) for p in doc.pages]
        return DocumentContent(document_id=document_id, pages=pages)

    async def pdf_path(self, document_id: str) -> Path:
        return await run_in_threadpool(self._repo.pdf_path, document_id)

    async def analysis(self, document_id: str) -> DocumentAnalysis:
        doc = await run_in_threadpool(self._repo.get, document_id)
        if doc.analysis:
            return doc.analysis
        if doc.record.needs_ocr:
            raise BadRequest("This PDF has no readable text, so it cannot be analysed yet")
        draft = analyze(_page_inputs(doc.pages))
        analysis = DocumentAnalysis(
            document_id=document_id, summary=draft.summary, document_type=draft.document_type,
            clauses=[
                Clause(id=c.id, title=c.title, original_text=c.text, category=c.category, importance=c.importance,
                       flag=c.flag, page=c.page, paragraph_ids=c.paragraph_ids)
                for c in draft.clauses
            ],
            obligations=draft.obligations, missing_information=draft.missing_information,
            key_dates=[KeyDate(**d) for d in draft.key_dates], lawyer_questions=draft.lawyer_questions,
            legal_references=[LegalReference(text=str(r["text"]), page=int(r["page"]), verified=False) for r in draft.legal_references],
        )
        doc.analysis = analysis
        doc.record.analyzed = True
        doc.record.detected_type = draft.document_type
        doc.record.history.append(_event("analyzed", f"{len(analysis.clauses)} clauses found by rules"))
        await run_in_threadpool(self._repo.save, doc)
        log.info("document_analyzed", document_id=document_id, clauses=len(analysis.clauses))
        return analysis

    async def compare(self, left_id: str, right_id: str) -> DocumentComparison:
        if left_id == right_id:
            raise ValidationFailed("Choose two different documents")
        left, right = await self.analysis(left_id), await self.analysis(right_id)
        changes = compare_clauses(
            [ClauseText(c.title, c.original_text) for c in left.clauses],
            [ClauseText(c.title, c.original_text) for c in right.clauses],
        )
        return DocumentComparison(
            left_id=left_id, right_id=right_id,
            changes=[ClauseChange(type=c.type, title=c.title, before=c.before, after=c.after) for c in changes],
        )

    async def delete(self, document_id: str) -> None:
        await run_in_threadpool(self._repo.delete, document_id)
        log.info("document_deleted", document_id=document_id)
