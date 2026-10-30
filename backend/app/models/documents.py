import uuid
from datetime import datetime

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, in_list, uuid_pk

UPLOAD_STATUS = ("stored", "processing", "ready", "failed", "deleted")
ANALYSIS_STATUS = ("pending", "running", "completed", "failed")
ANALYSIS_KIND = ("analysis", "comparison")
RISK_LEVELS = ("none", "low", "medium", "high")


class UploadedDocument(Base, TimestampMixin):
    __tablename__ = "uploaded_documents"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)  # server-generated
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    page_count: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="stored", server_default="stored")
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint(in_list("status", UPLOAD_STATUS), name="status"),
        CheckConstraint("size_bytes >= 0", name="size_nonnegative"),
    )


class DocumentAnalysis(Base, TimestampMixin):
    __tablename__ = "document_analysis"

    id: Mapped[uuid.UUID] = uuid_pk()
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("uploaded_documents.id", ondelete="CASCADE"), nullable=False,
        index=True
    )
    compared_with_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("uploaded_documents.id", ondelete="CASCADE")
    )
    kind: Mapped[str] = mapped_column(String(15), nullable=False, default="analysis",
                                      server_default="analysis")
    status: Mapped[str] = mapped_column(String(15), nullable=False, default="pending",
                                        server_default="pending")
    summary: Mapped[str | None] = mapped_column(Text)
    result: Mapped[dict | None] = mapped_column(JSONB)       # dates, obligations, missing info, sources
    model: Mapped[str | None] = mapped_column(String(200))
    error: Mapped[str | None] = mapped_column(String(500))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint(in_list("kind", ANALYSIS_KIND), name="kind"),
        CheckConstraint(in_list("status", ANALYSIS_STATUS), name="status"),
        CheckConstraint("(kind = 'comparison') = (compared_with_id IS NOT NULL)", name="comparison_target"),
    )


class DocumentClause(Base):
    __tablename__ = "document_clauses"

    id: Mapped[uuid.UUID] = uuid_pk()
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("document_analysis.id", ondelete="CASCADE"), nullable=False,
        index=True
    )
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    heading: Mapped[str | None] = mapped_column(String(500))
    text: Mapped[str] = mapped_column(Text, nullable=False)
    plain_language: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(60))
    # Preliminary AI assessment only; never a legal judgment.
    risk_level: Mapped[str | None] = mapped_column(String(10))
    risk_rationale: Mapped[str | None] = mapped_column(Text)
    details: Mapped[dict | None] = mapped_column(JSONB)

    __table_args__ = (
        CheckConstraint("risk_level IS NULL OR " + in_list("risk_level", RISK_LEVELS), name="risk_level"),
        Index("uq_document_clauses_analysis_ordinal", "analysis_id", "ordinal", unique=True),
    )
