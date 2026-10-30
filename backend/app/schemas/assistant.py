from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class HistoryTurn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class AnswerRequest(BaseModel):
    """Request fields beyond the ratified contract (region_code, history) are PROPOSED; see DATA_CONTRACTS."""

    model_config = ConfigDict(extra="forbid")

    question: str = Field(min_length=1, max_length=2000)
    jurisdiction_code: str = Field(min_length=2, max_length=8)
    region_code: str | None = Field(default=None, max_length=64)
    language: str = Field(default="en", min_length=2, max_length=8)
    conversation_id: str | None = Field(default=None, max_length=64)
    history: list[HistoryTurn] = Field(default_factory=list, max_length=8)


class NextStep(BaseModel):
    title: str
    detail: str


class StructuredAnswer(BaseModel):
    """PROPOSED extension of Answer (ADR-018). Provisions and sources stay empty until a verified corpus exists."""

    simple_explanation: str
    next_steps: list[NextStep]
    limitations: list[str]
    follow_ups: list[str]
    provisions: list[dict] = Field(default_factory=list)


class Answer(BaseModel):
    message_id: str
    conversation_id: str | None
    status: Literal["answered", "refused", "needs_clarification"]
    text: str
    sources: list[dict] = Field(default_factory=list)  # verified sources only; none exist yet
    refusal_reason: str | None = None
    disclaimer_key: str = "general_information"
    structured: StructuredAnswer
    generated_by: Literal["ai"] = "ai"
