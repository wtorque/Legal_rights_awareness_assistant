import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, uuid_pk


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = uuid_pk()
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user", server_default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    preferences: Mapped["UserPreference"] = relationship(back_populates="user", uselist=False,
                                                         cascade="all, delete-orphan")

    __table_args__ = (
        # Case-insensitive uniqueness on email.
        Index("uq_users_email_lower", func.lower(email), unique=True),
    )


class UserPreference(Base, TimestampMixin):
    __tablename__ = "user_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    preferred_language: Mapped[str] = mapped_column(String(16), nullable=False, default="en",
                                                    server_default="en")
    default_country_code: Mapped[str | None] = mapped_column(String(2))
    default_subdivision_code: Mapped[str | None] = mapped_column(String(10))
    # Privacy controls
    store_history: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True,
                                                server_default="true")
    retention_days: Mapped[int | None] = mapped_column()  # NULL = use platform default
    extra: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default="{}")

    user: Mapped[User] = relationship(back_populates="preferences")


class RefreshToken(Base):
    """Server-side record of issued refresh tokens (stored as SHA-256 hash only)."""

    __tablename__ = "refresh_tokens"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    family_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
