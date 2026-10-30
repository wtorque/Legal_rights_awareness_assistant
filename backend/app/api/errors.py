from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppError
from app.core.logging import get_logger

log = get_logger("errors")


def _rid(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


def _envelope(request: Request, status: int, code: str, message: str, details=None) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message, "details": details, "request_id": _rid(request)}},
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error(request: Request, exc: AppError):
        return _envelope(request, exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError):
        # Report location + message only; never echo submitted input values.
        details = [{"loc": [str(p) for p in e["loc"]], "message": e["msg"], "type": e["type"]}
                   for e in exc.errors()]
        return _envelope(request, 422, "validation_error", "Request validation failed", details)

    @app.exception_handler(StarletteHTTPException)
    async def http_error(request: Request, exc: StarletteHTTPException):
        code = {404: "not_found", 405: "method_not_allowed", 401: "unauthorized", 403: "forbidden"}.get(
            exc.status_code, "http_error")
        return _envelope(request, exc.status_code, code, str(exc.detail))

    @app.exception_handler(Exception)
    async def unhandled(request: Request, exc: Exception):
        log.error("unhandled_exception", error_type=type(exc).__name__, request_id=_rid(request))
        return _envelope(request, 500, "internal_error", "Internal server error")
