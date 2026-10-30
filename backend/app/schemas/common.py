from pydantic import BaseModel, ConfigDict


class ErrorBody(BaseModel):
    code: str
    message: str
    details: list | dict | None = None
    request_id: str | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody


class HealthResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str  # "ok" | "degraded"
    version: str
    environment: str
    database: str  # "ok" | "unavailable"
    pgvector: str  # "ok" | "missing" | "unknown"
