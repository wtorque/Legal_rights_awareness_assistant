"""Sliding-window counters. Process-local: slows abuse on one instance; several instances need a shared store."""
import time
from collections import defaultdict, deque

from app.core.exceptions import RateLimited


class SlidingWindow:
    def __init__(self, limit: int, window_seconds: float) -> None:
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def _prune(self, key: str, now: float) -> deque[float]:
        hits = self._hits[key]
        while hits and hits[0] <= now - self.window:
            hits.popleft()
        return hits

    def count(self, key: str) -> int:
        return len(self._prune(key, time.monotonic()))

    def record(self, key: str) -> None:
        now = time.monotonic()
        self._prune(key, now).append(now)

    def hit(self, key: str, message: str = "Too many requests. Please slow down.") -> None:
        """Count one request and raise RateLimited once the limit is passed."""
        now = time.monotonic()
        hits = self._prune(key, now)
        if len(hits) >= self.limit:
            raise RateLimited(message)
        hits.append(now)

    def clear(self) -> None:
        self._hits.clear()
