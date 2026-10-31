"""Detects instruction-like text inside uploaded documents.

Document text is data. This scan does not make the text safe; it only tells the reader that the file tries to
talk to an AI. The structural defence is that document text is never given to a model as instructions.
"""
import re

_PATTERNS: dict[str, re.Pattern[str]] = {
    "asks an AI to ignore earlier instructions": re.compile(
        r"(?i)\b(ignore|disregard|forget|override)\b.{0,40}\b(previous|prior|above|earlier|all|system)\b.{0,30}\b(instructions?|prompts?|rules?)\b"),
    "addresses an AI assistant directly": re.compile(
        r"(?i)\b(as an? (ai|language model|assistant)|you are (now )?(an? )?(ai|assistant|chatbot|dan)|system prompt)\b"),
    "tries to change the AI's role": re.compile(r"(?i)\b(pretend to be|act as|new instructions?|developer mode|jailbreak)\b"),
    "asks to reveal hidden instructions": re.compile(r"(?i)\b(reveal|print|show|repeat)\b.{0,30}\b(system prompt|hidden instructions?|your instructions)\b"),
}


def find_injection_attempts(text: str) -> list[str]:
    """Return a stable list of human-readable labels. Never returns the matched text."""
    return [label for label, pattern in _PATTERNS.items() if pattern.search(text)]
