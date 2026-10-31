from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Category = Literal["housing", "employment", "consumer", "financial", "other"]
Status = Literal["processing", "ready", "failed"]
EventKind = Literal["uploaded", "processed", "failed", "analyzed"]
Importance = Literal["high", "medium", "low"]
Flag = Literal["attention", "ambiguous", "obligation", "missing"]
ChangeType = Literal["added", "removed", "modified"]


class DocumentEvent(BaseModel):
    at: datetime
    kind: EventKind
    detail: str


class DocumentRecord(BaseModel):
    id: str
    name: str
    category: Category
    pages: int
    size_bytes: int
    uploaded_at: datetime
    status: Status
    origin: Literal["upload"] = "upload"
    analyzed: bool = False
    detected_type: str | None = None
    # True when the PDF has no text layer. OCR is not available, so such files can be previewed but not analysed.
    needs_ocr: bool = False
    warnings: list[str] = Field(default_factory=list)
    failure_reason: str | None = None
    history: list[DocumentEvent] = Field(default_factory=list)


class Paragraph(BaseModel):
    id: str
    text: str
    clause_id: str | None = None


class Page(BaseModel):
    number: int
    paragraphs: list[Paragraph]


class DocumentContent(BaseModel):
    document_id: str
    pages: list[Page]


class Clause(BaseModel):
    id: str
    title: str
    original_text: str
    # None until a plain-language explanation exists. Rule-based analysis never invents one.
    simplified: str | None = None
    category: str
    importance: Importance
    flag: Flag | None
    page: int
    source_id: str | None = None
    paragraph_ids: list[str] = Field(default_factory=list)


class KeyDate(BaseModel):
    label: str
    value: str


class LegalReference(BaseModel):
    """A citation exactly as written in the document. `verified` stays False until checked against an official source."""

    text: str
    page: int
    verified: bool = False


class DocumentAnalysis(BaseModel):
    document_id: str
    summary: str
    document_type: str
    clauses: list[Clause]
    obligations: list[str]
    missing_information: list[str]
    key_dates: list[KeyDate]
    lawyer_questions: list[str]
    legal_references: list[LegalReference]
    origin: Literal["extracted"] = "extracted"
    generated_by: Literal["rules"] = "rules"
    demonstration_only: Literal[False] = False


class StoredDocument(BaseModel):
    """On-disk shape. Never returned directly."""

    record: DocumentRecord
    pages: list[Page]
    analysis: DocumentAnalysis | None = None


class CompareRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    left_id: str = Field(min_length=32, max_length=32)
    right_id: str = Field(min_length=32, max_length=32)


class ClauseChange(BaseModel):
    type: ChangeType
    title: str
    before: str | None
    after: str | None


class DocumentComparison(BaseModel):
    left_id: str
    right_id: str
    changes: list[ClauseChange]
