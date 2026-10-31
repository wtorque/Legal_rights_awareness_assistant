from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

Language = Literal["en", "hi", "te", "ta", "kn", "bn", "mr", "hinglish"]


class NotificationPrefs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # Follow-ups are never sent without an explicit opt-in per conversation; this is the account-level switch.
    follow_ups: bool = False
    product_updates: bool = False


class User(BaseModel):
    id: str
    email: str
    name: str
    language: Language = "en"
    role: Literal["user", "admin"] = "user"
    notifications: NotificationPrefs = Field(default_factory=NotificationPrefs)
    created_at: datetime


class StoredUser(User):
    """On-disk shape. The hash never leaves the repository and service layers."""

    password_hash: str


class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    name: str = Field(min_length=1, max_length=80)
    language: Language = "en"


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    refresh_token: str = Field(min_length=10, max_length=2048)


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=80)
    language: Language | None = None
    notifications: NotificationPrefs | None = None


class PasswordChange(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=10, max_length=128)


class Session(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: User
