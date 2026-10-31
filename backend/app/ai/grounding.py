"""Removes claims the model cannot support. No verified legal text is retrieved yet, so any specific number, deadline,
amount, guarantee or claim of authority in the answer is unsupported unless the user wrote it first.

Works sentence by sentence: an offending sentence is dropped, never rewritten, so the model cannot be nudged into
producing a "corrected" version of a fabricated fact.
"""
import re
import unicodedata

from app.ai.guard import normalise

# No split after "v.", "Sec.", "Rs." and similar, so "Ramesh v. State" stays in one sentence for the citation check.
_SENTENCE = re.compile(
    r"(?<=[!?।॥])\s+|(?<=\.)(?<!\bv\.)(?<!\bvs\.)(?<!\bSec\.)(?<!\bRs\.)(?<!\bNo\.)(?<!\bMr\.)(?<!\bMrs\.)(?<!\bDr\.)(?<!\b[A-Z]\.)\s+|\n+"
)

_NUMBER_WORDS = (
    "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|ninety|hundred|thousand|"
    "ek|do|teen|char|paanch|das|bees|tees|pandrah|sau|hazaar|lakh"
)
_UNITS = (
    r"%|percent|per\s*cent|rupees?|rs\b|inr|lakhs?|crores?|thousand|days?|weeks?|months?|years?|hours?|minutes?|"
    r"din|hafte|mahine|mahina|saal|ghante|rupaye|"
    r"दिन|हफ्ते|हफ़्ते|सप्ताह|महीने|महीना|साल|वर्ष|घंटे|रुपये|रुपए|प्रतिशत|लाख|करोड़|हज़ार|हजार|"
    r"లక్షలు?|కోట్లు|రోజులు?|రోజుల్లో|రోజుల|నెలలు?|నెలల|వారాలు?|గంటలు?|సంవత్సరాలు?|సంవత్సరాల|రూపాయలు?|శాతం"
)
_CLAIM = re.compile(
    rf"(?:(?:₹|rs\.?|inr)\s*[\d,]+(?:\.\d+)?)|(?:[\d,]+(?:\.\d+)?\s*(?:{_UNITS}))|(?:\b(?:{_NUMBER_WORDS})\s+(?:{_UNITS})\b)",
    re.IGNORECASE,
)
_NUM = re.compile(r"\d[\d,]*(?:\.\d+)?")
_WORD = re.compile(rf"\b(?:{_NUMBER_WORDS})\b", re.IGNORECASE)

_GUARANTEE = re.compile(
    r"(?i)\b(?:guarantee[ds]?|100\s*%|definitely\s+(?:win|get|succeed)|certainly\s+(?:win|get|succeed)|you\s+(?:will|'ll)\s+(?:surely|definitely|certainly|always)\s+\w+|"
    r"no\s+doubt|without\s+(?:any\s+)?doubt|sure\s+to\s+win|cannot\s+lose|can'?t\s+lose|pakka\s+(?:jeet|mil)\w*|zaroor\s+(?:jeet|mil)\w*|guaranteed)\b"
    r"|गारंटी|निश्चित\s*रूप\s*से\s*(?:जीत|मिल)|ज़रूर\s*जीत|पक्का\s*(?:जीत|मिल)|హామీ\s*(?:ఇస్తున్నా|ఉంది)|తప్పకుండా\s*గెలు"
)
_AUTHORITY = re.compile(
    r"(?i)\b(?:i\s+am\s+(?:a|your)\s+(?:lawyer|advocate|attorney|solicitor)|as\s+your\s+(?:lawyer|advocate|attorney)|this\s+is\s+(?:legal|professional)\s+advice|"
    r"i\s+(?:will|can)\s+(?:represent|file\s+(?:a\s+)?(?:case|complaint|suit)\s+for)\s+you|main\s+(?:aapka\s+)?(?:vakeel|advocate)\s+hoon)\b"
    r"|मैं\s+(?:आपका\s+)?(?:वकील|अधिवक्ता)\s+हूँ|నేను\s+(?:మీ\s+)?(?:న్యాయవాది|లాయర్)"
)
# A pattern that only a rights helper has a reason to say: "the law says you must do X within N days".
_UNVERIFIABLE_LAW = re.compile(r"(?i)\b(?:the\s+law\s+(?:says|states|requires)|by\s+law\s+(?:you|they|he|she|the)\b|legally\s+(?:required|must))\b.{0,80}\b(?:within|before|after|every|at\s+least|at\s+most|up\s+to)\b")

_ASKS_SPECIFICS = re.compile(
    r"(?i)\b(?:which|what)\s+(?:section|article|act|law|rule|case|judg(?:e)?ment|court\s+case)\b|\bsection\s+number\b|\bcase\s+law\b|\bprecedent\b|\bcite\b|\bcitation\b|"
    r"\bhow\s+(?:many|much|long)\b|\bwithin\s+how\b|\bdeadline\b|\btime\s*limit\b|\blimitation\s+period\b|\bpenalty\b|\bfine\b|\bpunishment\b|\bcompensation\s+(?:amount|of)\b|\bhow\s+much\s+(?:can|should|do)\b|"
    r"\bkaun\s+si\s+(?:dhara|act)\b|\bkitne\s+(?:din|mahine|saal|paise|rupaye)\b|\bkitna\s+(?:jurmana|paisa|muavza)\b|\bsazaa?\b|"
    r"कौन\s*सी\s*(?:धारा|अधिनियम)|कितने\s*(?:दिन|महीने|साल|रुपये)|कितना\s*(?:जुर्माना|मुआवज़ा|पैसा)|सज़ा|జరిమానా|ఏ\s*సెక్షన్|ఎన్ని\s*(?:రోజులు|నెలలు)|ఎంత\s*(?:జరిమానా|పరిహారం)"
)


# Jurisdiction drift: the supported jurisdiction is India, so another country's states or name is a fabrication
# unless the user brought it up themselves.
_FOREIGN = re.compile(
    r"\b(?:Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|"
    r"Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New\s+Hampshire|New\s+Jersey|New\s+Mexico|New\s+York|North\s+Carolina|North\s+Dakota|"
    r"Ohio|Oklahoma|Oregon|Pennsylvania|Rhode\s+Island|South\s+Carolina|South\s+Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Wisconsin|Wyoming|"
    r"United\s+States|U\.S\.A?\.?|USA|United\s+Kingdom|U\.K\.|England|Scotland|Wales|Canada|Ontario|Australia|Singapore|Ireland|New\s+Zealand)\b"
)


def asks_for_specifics(text: str) -> bool:
    return bool(_ASKS_SPECIFICS.search(normalise(text)))


_WORD_VALUE = {w: str(v) for v, w in enumerate(["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"])}
_WORD_VALUE |= {"fifteen": "15", "twenty": "20", "thirty": "30", "forty": "40", "fifty": "50", "sixty": "60", "ninety": "90", "hundred": "100", "thousand": "1000",
                "ek": "1", "do": "2", "teen": "3", "char": "4", "paanch": "5", "das": "10", "bees": "20", "tees": "30", "pandrah": "15", "sau": "100", "hazaar": "1000", "lakh": "100000"}


def _canon(number: str) -> str:
    cleaned = number.replace(",", "")
    return cleaned[:-2] if cleaned.endswith(".0") else cleaned


def _numbers_in(text: str) -> set[str]:
    """Digits and number words, as one comparable set of digit strings."""
    norm = normalise(text).lower()
    return {_canon(n) for n in _NUM.findall(norm)} | {_WORD_VALUE.get(w, w) for w in _WORD.findall(norm)}


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENTENCE.split(text) if s and s.strip()]


def _ungrounded_claim(sentence: str, allowed: set[str]) -> bool:
    norm = normalise(sentence)
    for m in _CLAIM.finditer(norm):
        claim = _numbers_in(m.group(0))
        if not claim or not claim <= allowed:
            return True
    return bool(_UNVERIFIABLE_LAW.search(norm) and _NUM.search(norm))


def sentence_problem(sentence: str, allowed_numbers: set[str], context: str = "") -> str | None:
    """Reason a sentence must go, or None. `allowed_numbers` are numbers the user supplied themselves."""
    norm = normalise(sentence)
    if _GUARANTEE.search(norm):
        return "guarantee"
    if _AUTHORITY.search(norm):
        return "authority"
    if _ungrounded_claim(sentence, allowed_numbers):
        return "unverified_specific"
    foreign = _FOREIGN.search(norm)
    if foreign and foreign.group(0).lower() not in normalise(context).lower():
        return "foreign_jurisdiction"
    return None


def user_numbers(*texts: str) -> set[str]:
    out: set[str] = set()
    for t in texts:
        out |= _numbers_in(t)
    return out


def clean_sentences(text: str, allowed_numbers: set[str]) -> tuple[str, list[str]]:
    """Returns the text without offending sentences, and the list of reasons for each removal."""
    kept, reasons = [], []
    for s in split_sentences(text):
        reason = sentence_problem(s, allowed_numbers)
        if reason:
            reasons.append(reason)
        else:
            kept.append(s)
    return " ".join(kept), reasons


def printable(text: str) -> str:
    """Drops control characters from model output before it reaches a user."""
    return "".join(ch for ch in text if unicodedata.category(ch)[0] != "C" or ch in "\n\t")
