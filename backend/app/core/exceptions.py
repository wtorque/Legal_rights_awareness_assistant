"""Application errors and the single error envelope returned by every endpoint.

Envelope: {"error": {"code": str, "message": str, "details": [...] | null, "request_id": str | null}}
"""
from typing import Any


class AppError(Exception):
    status_code = 500
    code = "internal_error"

    def __init__(self, message: str = "Internal server error", *, details: Any = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details


class ValidationFailed(AppError):
    status_code = 422
    code = "validation_error"


class BadRequest(AppError):
    status_code = 400
    code = "bad_request"


class Unauthorized(AppError):
    status_code = 401
    code = "unauthorized"


class Forbidden(AppError):
    status_code = 403
    code = "forbidden"


class NotFound(AppError):
    status_code = 404
    code = "not_found"


class Conflict(AppError):
    status_code = 409
    code = "conflict"


class PayloadTooLarge(AppError):
    status_code = 413
    code = "payload_too_large"


class RateLimited(AppError):
    status_code = 429
    code = "rate_limited"


class UpstreamUnavailable(AppError):
    status_code = 503
    code = "upstream_unavailable"


class UnsupportedJurisdiction(AppError):
    status_code = 422
    code = "unsupported_jurisdiction"
