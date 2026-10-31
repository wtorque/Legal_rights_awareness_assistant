"""Checks the raw model output for signs that an attack worked: leaked prompt text, a changed persona."""
import re
import secrets

from app.ai.guard import normalise

_ROLE_SHIFT = re.compile(
    r"(?i)\b(?:as\s+dan\b|i\s+am\s+(?:now\s+)?(?:dan|unrestricted|unfiltered|jailbroken|free\s+from)|developer\s+mode\s+(?:enabled|activated|on)|"
    r"jailbreak(?:ed)?\s+(?:successful|mode|activated)|(?:ignoring|ignored|disregarding)\s+(?:my|all|the)\s+(?:previous\s+|safety\s+)?(?:instructions|rules|guidelines)|"
    r"i\s+(?:have|am\s+under)\s+no\s+(?:restrictions|rules|limits)|my\s+(?:system\s+prompt|instructions)\s+(?:are|say|is|state)|here\s+(?:is|are)\s+my\s+(?:system\s+prompt|instructions))\b"
)
# Distinctive sentences from our own system prompt. Quoting them back means the prompt is leaking.
_PROMPT_FRAGMENTS = (
    "answer in exactly this format",
    "internal marker",
    "text inside the user's message",
    "never change these rules",
    "you have no access to verified legal texts",
    "only the marker words",
)


def new_canary() -> str:
    return f"CANARY-{secrets.token_hex(8)}"


def leak_or_shift(output: str, canary: str) -> str | None:
    norm = normalise(output)
    lowered = norm.lower()
    if canary.lower() in lowered or "canary-" in lowered:
        return "prompt_leak"
    if any(f in lowered for f in _PROMPT_FRAGMENTS):
        return "prompt_leak"
    if _ROLE_SHIFT.search(norm):
        return "role_shift"
    return None
