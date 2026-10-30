import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, in_list, uuid_pk

MESSAGE_ROLES = ("user", "assistant", "system")
EVIDENCE_STATUS = ("sufficient", "partial", "insufficient", "unsupported_jurisdiction")
VERIFICATION_STATUS = ("verified", "unverified", "mismatched_jurisdiction", "not_found", "url_mismatch")


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str | None] = mapped_column(String(200))
    jurisdiction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jurisdictions.id", ondelete="SET NULL")
    )
    language: Mapped[str | None] = mapped_column(String(16))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))  # retention

    messages: Mapped[list["Message"]] = relationship(back_populates="conversation",
                                                     cascade="all, delete-orphan",
                                                     order_by="Message.created_at")

    __table_args__ = (Index("ix_conversations_user_updated", "user_id", "updated_at"),)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = uuid_pk()
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(10), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    structured_response: Mapped[dict | None] = mapped_column(JSONB)          # LegalResponse for assistant turns
    evidence_status: Mapped[str | None] = mapped_column(String(30))
    model: Mapped[str | None] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    conversation: Mapped[Conversation] = relationship(back_populates="messages")
    citations: Mapped[list["Citation"]] = relationship(back_populates="message",
                                                       cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint(in_list("role", MESSAGE_ROLES), name="role"),
        CheckConstraint("evidence_status IS NULL OR " + in_list("evidence_status", EVIDENCE_STATUS),
                        name="evidence_status"),
    )


class Citation(Base):
    """A citation attached to an assistant message, with its verification outcome."""

    __tablename__ = "citations"

    id: Mapped[uuid.UUID] = uuid_pk()
    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # NULL when the model cited something that does not exist (kept for audit; status = not_found).
    section_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_sections.id", ondelete="SET NULL"), index=True
    )
    claimed_source_id: Mapped[str | None] = mapped_column(String(200))
    claimed_section: Mapped[str | None] = mapped_column(String(200))
    verification_status: Mapped[str] = mapped_column(String(30), nullable=False)
    details: Mapped[dict | None] = mapped_column(JSONB)

    message: Mapped[Message] = relationship(back_populates="citations")

    __table_args__ = (CheckConstraint(in_list("verification_status", VERIFICATION_STATUS),
                                      name="verification_status"),)
