"""Ollama local chat completions with streaming."""
import json
from collections.abc import AsyncIterator

import httpx

from app.ai.providers.nvidia import ChatMessage
from app.core.config import Settings
from app.core.exceptions import UpstreamUnavailable
from app.core.logging import get_logger

log = get_logger("ollama")


class OllamaChatProvider:
    def __init__(self, settings: Settings) -> None:
        self._base = settings.ollama_base_url.rstrip("/")
        self._model = settings.ollama_chat_model
        self._timeout = settings.ollama_timeout_seconds

    @property
    def configured(self) -> bool:
        return bool(self._base and self._model)

    async def stream(self, messages: list[ChatMessage], *, max_tokens: int = 1500) -> AsyncIterator[str]:
        """Yield answer text deltas from Ollama with think=False for fast responses."""
        if not self.configured:
            raise UpstreamUnavailable("Ollama is not configured")

        url = f"{self._base}/api/chat"
        payload = {
            "model": self._model,
            "messages": messages,
            "stream": True,
            "think": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": 0.3,
            },
        }
        timeout = httpx.Timeout(connect=10.0, read=self._timeout, write=10.0, pool=10.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream("POST", url, json=payload) as resp:
                    if resp.status_code >= 400:
                        log.warning("ollama_error", status=resp.status_code)
                        raise UpstreamUnavailable("Ollama returned an error")
                    async for line in resp.aiter_lines():
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            chunk = json.loads(line)
                        except (KeyError, ValueError):
                            continue
                        text = chunk.get("message", {}).get("content", "")
                        if text:
                            yield text
                        if chunk.get("done", False):
                            return
        except (httpx.TimeoutException, httpx.TransportError) as exc:
            log.warning("ollama_transport_error", error_type=type(exc).__name__)
            raise UpstreamUnavailable("Could not connect to Ollama. Is it running?") from exc
