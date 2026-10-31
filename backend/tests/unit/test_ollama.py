import json
import pytest

from app.ai.providers.ollama import OllamaChatProvider
from app.core.config import Settings
from app.core.exceptions import UpstreamUnavailable


def test_ollama_provider_configured():
    s = Settings(ollama_base_url="http://localhost:11434", ollama_chat_model="qwen3.5:4b")
    p = OllamaChatProvider(s)
    assert p.configured is True

    s_empty = Settings(ollama_base_url="", ollama_chat_model="")
    p_empty = OllamaChatProvider(s_empty)
    assert p_empty.configured is False


async def test_ollama_provider_raises_when_unconfigured():
    s = Settings(ollama_base_url="", ollama_chat_model="")
    p = OllamaChatProvider(s)
    with pytest.raises(UpstreamUnavailable):
        async for _ in p.stream([{"role": "user", "content": "hi"}]):
            pass
