import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, in_list, uuid_pk

STEP_STATUS = ("pending", "in_progress", "done", "skipped")


class ActionPlan(Base, TimestampMixin):
    __tablename__ = "action_plans"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    conversation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="SET NULL")
    )
    jurisdiction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jurisdictions.id", ondelete="SET NULL")
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    situation_summary: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(80))
    evidence_status: Mapped[str | None] = mapped_column(String(30))
    follow_up_questions: Mapped[list | None] = mapped_column(JSONB)
    authorities: Mapped[list | None] = mapped_column(JSONB)
    limitations: Mapped[list | None] = mapped_column(JSONB)

    steps: Mapped[list["ActionPlanStep"]] = relationship(back_populates="plan", cascade="all, delete-orphan",
                                                         order_by="ActionPlanStep.ordinal")

    __table_args__ = (Index("ix_action_plans_user_created", "user_id", "created_at"),)


class ActionPlanStep(Base):
    __tablename__ = "action_plan_steps"

    id: Mapped[uuid.UUID] = uuid_pk()
    plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("action_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(15), nullable=False, default="pending",
                                        server_default="pending")
    section_ids: Mapped[list | None] = mapped_column(JSONB)                   # supporting legal sections
    resource_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_aid_resources.id", ondelete="SET NULL")
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    plan: Mapped[ActionPlan] = relationship(back_populates="steps")

    __table_args__ = (
        CheckConstraint(in_list("status", STEP_STATUS), name="status"),
        Index("uq_action_plan_steps_plan_ordinal", "plan_id", "ordinal", unique=True),
    )
