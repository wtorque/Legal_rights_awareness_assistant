import uuid
from datetime import date, datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean, CheckConstraint, Computed, Date, DateTime, ForeignKey, Index, Integer, String, Text,
    UniqueConstraint, func, text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, TSVECTOR, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import get_settings
from app.models.base import Base, TimestampMixin, in_list, uuid_pk

LEGAL_SYSTEMS = ("common_law", "civil_law", "religious", "customary", "mixed", "unknown")
COVERAGE = ("none", "partial", "curated")
DOC_TYPES = ("constitution", "statute", "regulation", "case_law", "treaty", "guidance", "other")
REPEAL_STATUS = ("in_force", "partially_repealed", "repealed", "unknown")
TRUST_LEVELS = ("official", "verified_secondary", "unverified")
VERSION_STATUS = ("draft", "verified", "superseded", "withdrawn")


class Jurisdiction(Base, TimestampMixin):
    """A country (subdivision_code IS NULL) or a state/province within a country."""

    __tablename__ = "jurisdictions"

    id: Mapped[uuid.UUID] = uuid_pk()
    country_code: Mapped[str] = mapped_column(String(2), nullable=False)       # ISO 3166-1 alpha-2
    subdivision_code: Mapped[str | None] = mapped_column(String(10))           # ISO 3166-2 suffix
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jurisdictions.id", ondelete="RESTRICT")
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    native_name: Mapped[str | None] = mapped_column(String(200))
    subdivision_type: Mapped[str | None] = mapped_column(String(40))          # state, province, territory...
    legal_system: Mapped[str] = mapped_column(String(20), nullable=False, default="unknown",
                                              server_default="unknown")
    languages: Mapped[list[str]] = mapped_column(ARRAY(String(16)), nullable=False, default=list,
                                                 server_default="{}")
    coverage_status: Mapped[str] = mapped_column(String(10), nullable=False, default="none",
                                                 server_default="none")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    notes: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        UniqueConstraint("country_code", "subdivision_code", name="uq_jurisdictions_country_subdivision",
                         postgresql_nulls_not_distinct=True),
        CheckConstraint(in_list("legal_system", LEGAL_SYSTEMS), name="legal_system"),
        CheckConstraint(in_list("coverage_status", COVERAGE), name="coverage_status"),
        CheckConstraint("country_code = upper(country_code) AND length(country_code) = 2", name="country_code"),
        CheckConstraint("(subdivision_code IS NULL) = (parent_id IS NULL)", name="subdivision_has_parent"),
        Index("ix_jurisdictions_country_code", "country_code"),
    )


class LegalSource(Base, TimestampMixin):
    """A trusted publisher (e.g. an official gazette portal). Citation URLs are verified against these."""

    __tablename__ = "legal_sources"

    id: Mapped[uuid.UUID] = uuid_pk()
    jurisdiction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jurisdictions.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    publisher: Mapped[str | None] = mapped_column(String(300))
    base_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    trust_level: Mapped[str] = mapped_column(String(20), nullable=False, default="unverified",
                                             server_default="unverified")
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    __table_args__ = (CheckConstraint(in_list("trust_level", TRUST_LEVELS), name="trust_level"),)


class LegalDocument(Base, TimestampMixin):
    __tablename__ = "legal_documents"

    id: Mapped[uuid.UUID] = uuid_pk()
    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_sources.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    jurisdiction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jurisdictions.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    doc_type: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    short_title: Mapped[str | None] = mapped_column(String(200))
    official_identifier: Mapped[str | None] = mapped_column(String(200))      # e.g. act number
    official_url: Mapped[str] = mapped_column(String(2000), nullable=False)
    language: Mapped[str] = mapped_column(String(16), nullable=False, default="en", server_default="en")
    publication_date: Mapped[date | None] = mapped_column(Date)
    effective_date: Mapped[date | None] = mapped_column(Date)
    amendment_date: Mapped[date | None] = mapped_column(Date)
    repeal_status: Mapped[str] = mapped_column(String(20), nullable=False, default="unknown",
                                               server_default="unknown")
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    topics: Mapped[list[str]] = mapped_column(ARRAY(String(80)), nullable=False, default=list,
                                              server_default="{}")

    versions: Mapped[list["LegalDocumentVersion"]] = relationship(back_populates="document")

    __table_args__ = (
        CheckConstraint(in_list("doc_type", DOC_TYPES), name="doc_type"),
        CheckConstraint(in_list("repeal_status", REPEAL_STATUS), name="repeal_status"),
        UniqueConstraint("source_id", "official_identifier", name="uq_legal_documents_source_identifier"),
    )


class LegalDocumentVersion(Base):
    __tablename__ = "legal_document_versions"

    id: Mapped[uuid.UUID] = uuid_pk()
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_identifier: Mapped[str] = mapped_column(String(100), nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)     # SHA-256 of source text
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft", server_default="draft")
    is_current: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    effective_from: Mapped[date | None] = mapped_column(Date)
    effective_to: Mapped[date | None] = mapped_column(Date)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    document: Mapped[LegalDocument] = relationship(back_populates="versions")
    sections: Mapped[list["LegalSection"]] = relationship(back_populates="version")

    __table_args__ = (
        UniqueConstraint("document_id", "version_identifier", name="uq_legal_document_versions_doc_version"),
        CheckConstraint(in_list("status", VERSION_STATUS), name="status"),
        CheckConstraint("effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from",
                        name="effective_range"),
        # At most one current version per document.
        Index("uq_legal_document_versions_one_current", "document_id", unique=True,
              postgresql_where=text("is_current")),
    )


class LegalSection(Base):
    __tablename__ = "legal_sections"

    id: Mapped[uuid.UUID] = uuid_pk()
    version_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_document_versions.id", ondelete="CASCADE"), nullable=False,
        index=True
    )
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_sections.id", ondelete="CASCADE"), index=True
    )
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)             # document order
    level: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    section_number: Mapped[str | None] = mapped_column(String(50))            # as printed: "12", "12(1)(a)"
    heading: Mapped[str | None] = mapped_column(String(1000))
    text: Mapped[str] = mapped_column(Text, nullable=False)

    version: Mapped[LegalDocumentVersion] = relationship(back_populates="sections")

    __table_args__ = (
        UniqueConstraint("version_id", "ordinal", name="uq_legal_sections_version_ordinal"),
        Index("ix_legal_sections_version_number", "version_id", "section_number"),
    )


class LegalChunk(Base):
    __tablename__ = "legal_chunks"

    id: Mapped[uuid.UUID] = uuid_pk()
    section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_sections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Denormalised so retrieval can filter by jurisdiction / currency without joins.
    version_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_document_versions.id", ondelete="CASCADE"), nullable=False,
        index=True
    )
    jurisdiction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jurisdictions.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int | None] = mapped_column(Integer)
    # 'simple' config: language-neutral tokenisation (no stemming) since sources can be multilingual.
    tsv = mapped_column(TSVECTOR, Computed("to_tsvector('simple', text)", persisted=True))

    __table_args__ = (
        UniqueConstraint("section_id", "chunk_index", name="uq_legal_chunks_section_chunk"),
        Index("ix_legal_chunks_tsv", "tsv", postgresql_using="gin"),
    )


class LegalEmbedding(Base):
    __tablename__ = "legal_embeddings"

    id: Mapped[uuid.UUID] = uuid_pk()
    chunk_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_chunks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    model: Mapped[str] = mapped_column(String(200), nullable=False)
    embedding = mapped_column(Vector(get_settings().embedding_dim), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("chunk_id", "model", name="uq_legal_embeddings_chunk_model"),
        Index("ix_legal_embeddings_hnsw", "embedding", postgresql_using="hnsw",
              postgresql_with={"m": 16, "ef_construction": 64},
              postgresql_ops={"embedding": "vector_cosine_ops"}),
    )


class LegalAidResource(Base, TimestampMixin):
    __tablename__ = "legal_aid_resources"

    id: Mapped[uuid.UUID] = uuid_pk()
    jurisdiction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jurisdictions.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(40), nullable=False)    # helpline, clinic, authority...
    description: Mapped[str | None] = mapped_column(Text)
    url: Mapped[str | None] = mapped_column(String(2000))
    phone: Mapped[str | None] = mapped_column(String(50))
    email: Mapped[str | None] = mapped_column(String(320))
    languages: Mapped[list[str]] = mapped_column(ARRAY(String(16)), nullable=False, default=list,
                                                 server_default="{}")
    topics: Mapped[list[str]] = mapped_column(ARRAY(String(80)), nullable=False, default=list,
                                              server_default="{}")
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
