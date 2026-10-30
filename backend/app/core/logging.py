import logging
import re
import sys

import structlog

_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_BEARER = re.compile(r"(?i)bearer\s+[\w.~+/=-]+")
_LONG_DIGITS = re.compile(r"\b\d{9,}\b")


def redact(text: str) -> str:
    """Mask emails, bearer tokens and long digit runs (phone/ID numbers)."""
    text = _EMAIL.sub("[email]", text)
    text = _BEARER.sub("Bearer [token]", text)
    return _LONG_DIGITS.sub("[number]", text)


# Fields that must never be logged, whatever their value.
_BLOCKED_KEYS = {"password", "token", "access_token", "refresh_token", "authorization",
                 "api_key", "content", "text", "document_text", "question"}


def _scrub(_logger, _method, event_dict: dict) -> dict:
    for key in list(event_dict):
        if key.lower() in _BLOCKED_KEYS:
            event_dict[key] = "[redacted]"
        elif isinstance(event_dict[key], str):
            event_dict[key] = redact(event_dict[key])
    return event_dict


def configure_logging(level: str = "INFO", json_logs: bool = False) -> None:
    logging.basicConfig(format="%(message)s", stream=sys.stdout, level=level.upper())
    renderer = structlog.processors.JSONRenderer() if json_logs else structlog.dev.ConsoleRenderer()
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            _scrub,
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.getLevelName(level.upper())),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = "app"):
    return structlog.get_logger(name)
