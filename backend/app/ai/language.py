"""Chooses the reply language. The user's own writing wins over the saved preference when it is clearly different."""
import re

DEVANAGARI = re.compile(r"[ऀ-ॿ]")
TELUGU = re.compile(r"[ఀ-౿]")
# Common romanised-Hindi words that are not English words. Two or more distinct hits suggest Hinglish.
_HINGLISH = {
    "mera", "meri", "mere", "kya", "hai", "hain", "nahi", "nahin", "kaise", "kyun", "kyu", "malik", "makaan", "kiraya",
    "kiraye", "paise", "paisa", "wapas", "mujhe", "humein", "karna", "karo", "kar", "diya", "liya", "aap", "tum", "agar",
    "toh", "bhi", "sirf", "naukri", "tankhwah", "pagar", "sarkar", "thana", "adhikar", "haq",
}
SUPPORTED = {"en", "hi", "te", "hinglish"}


def resolve_language(question: str, preferred: str) -> str:
    """Returns one of en, hi, te, hinglish, or the preferred code when it is another supported UI language."""
    if TELUGU.search(question):
        return "te"
    if DEVANAGARI.search(question):
        return "hi"
    words = set(re.findall(r"[a-z]+", question.lower()))
    if len(words & _HINGLISH) >= 2:
        return "hinglish"
    return preferred
