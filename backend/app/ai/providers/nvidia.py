"""NVIDIA-hosted chat completions (OpenAI-compatible) with streaming. The only module that talks to NVIDIA."""
import asyncio
import json
from collections.abc import AsyncIterator
from typing import Literal, TypedDict

import httpx

from app.core.config import Settings
from app.core.exceptions import UpstreamUnavailable
from app.core.logging import get_logger

log = get_logger("nvidia")


class ChatMessage(TypedDict):
    role: Literal["system", "user", "assistant"]
    content: str


class NvidiaChatProvider:
    def __init__(self, settings: Settings) -> None:
        self._key = settings.nvidia_api_key.get_secret_value()
        self._base = settings.nvidia_base_url.rstrip("/")
        self._model = settings.nvidia_chat_model
        self._timeout = settings.nvidia_timeout_seconds
        self._retries = settings.nvidia_max_retries

    @property
    def configured(self) -> bool:
        return bool(self._key and self._model)

    async def stream(self, messages: list[ChatMessage], *, max_tokens: int = 1500) -> AsyncIterator[str]:
        """Yield answer text deltas. Reasoning tokens are dropped; they are never shown to users."""
        if not self.configured:
            raise UpstreamUnavailable("The AI service is not configured")

        payload = {
            "model": self._model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.3,
            "stream": True,
        }
        headers = {"Authorization": f"Bearer {self._key}", "Accept": "text/event-stream"}
        # Long read timeout: the model may reason for a while before the first answer token.
        timeout = httpx.Timeout(connect=10.0, read=self._timeout, write=10.0, pool=10.0)

        for attempt in range(self._retries + 1):
            started = False
            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    async with client.stream("POST", f"{self._base}/chat/completions", json=payload, headers=headers) as resp:
                        if resp.status_code in (429, 500, 502, 503, 504) and attempt < self._retries:
                            await asyncio.sleep(min(2**attempt, 8))
                            continue
                        if resp.status_code >= 400:
                            # Log status only: bodies can echo prompts.
                            log.warning("nvidia_error", status=resp.status_code)
                            raise UpstreamUnavailable("The AI service returned an error")
                        async for line in resp.aiter_lines():
                            if not line.startswith("data:"):
                                continue
                            data = line[5:].strip()
                            if data == "[DONE]":
                                return
                            try:
                                delta = json.loads(data)["choices"][0]["delta"]
                            except (KeyError, IndexError, ValueError):
                                continue
                            text = delta.get("content")
                            if text:
                                started = True
                                yield text
                        return
            except (httpx.TimeoutException, httpx.TransportError) as exc:
                log.warning("nvidia_transport_error", error_type=type(exc).__name__, attempt=attempt)
                # Never retry after text was already streamed: the client would see duplicates.
                if started or attempt >= self._retries:
                    raise UpstreamUnavailable("The AI service did not respond in time") from exc
                await asyncio.sleep(min(2**attempt, 8))
