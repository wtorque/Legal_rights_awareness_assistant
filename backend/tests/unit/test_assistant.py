import json

import pytest

from app.ai.services.assistant import AssistantService, parse_answer

RAW = """EXPLANATION:
Your landlord generally has to explain any deductions. Keep your receipts.
NEXT_STEPS:
- Collect papers :: Gather the agreement and the deposit receipt.
- Write to the landlord :: Ask for the deposit in writing.
FOLLOW_UPS:
- What if they claim damage?
- Can I get free legal help?
"""


def test_parse_answer_extracts_sections():
    p = parse_answer(RAW)
    assert p.explanation.startswith("Your landlord")
    assert [s["title"] for s in p.next_steps] == ["Collect papers", "Write to the landlord"]
    assert p.next_steps[0]["detail"].startswith("Gather")
    assert p.follow_ups == ["What if they claim damage?", "Can I get free legal help?"]


def test_parse_answer_without_markers_falls_back_to_whole_text():
    p = parse_answer("Just a plain answer.")
    assert p.explanation == "Just a plain answer."
    assert p.next_steps == [] and p.follow_ups == []


class FakeProvider:
    def __init__(self, chunks):
        self.chunks = chunks

    async def stream(self, messages, **_):
        assert messages[0]["role"] == "system" and messages[-1]["role"] == "user"
        for c in self.chunks:
            yield c


async def collect(chunks):
    svc = AssistantService(FakeProvider(chunks))
    out = [x async for x in svc.answer(question="q", history=[], language="en", jurisdiction="IN")]
    return out


async def test_stream_emits_only_the_explanation_even_when_markers_split_across_chunks():
    chunks = [RAW[i:i + 7] for i in range(0, len(RAW), 7)]
    out = await collect(chunks)
    deltas = "".join(t for k, t in out if k == "delta")
    assert "NEXT_STEPS" not in deltas and "EXPLANATION" not in deltas and "Collect papers" not in deltas
    assert deltas.strip().startswith("Your landlord")
    assert out[-1] == ("full", RAW)


async def test_endpoint_streams_sse_and_final_answer(client, monkeypatch):
    from app.api.v1.endpoints import assistant as ep

    monkeypatch.setattr(ep, "NvidiaChatProvider", lambda settings: FakeProvider([RAW]))
    monkeypatch.setattr(ep, "OllamaChatProvider", lambda settings: FakeProvider([RAW]))
    r = await client.post("/api/v1/assistant/answers", json={"question": "deposit?", "jurisdiction_code": "IN", "language": "en"})
    assert r.status_code == 200 and r.headers["content-type"].startswith("text/event-stream")
    events = [b for b in r.text.split("\n\n") if b.strip()]
    names = [e.split("\n")[0].removeprefix("event: ") for e in events]
    assert names[0] == "meta" and names[-1] == "final" and "delta" in names
    final = json.loads(events[-1].split("data: ", 1)[1])
    assert final["status"] == "answered" and final["sources"] == [] and final["generated_by"] == "ai"
    assert len(final["structured"]["next_steps"]) == 2
    assert any("not been checked" in l for l in final["structured"]["limitations"])


async def test_endpoint_rejects_bad_input_with_envelope(client):
    r = await client.post("/api/v1/assistant/answers", json={"question": "", "jurisdiction_code": "IN"})
    assert r.status_code == 422 and r.json()["error"]["code"] == "validation_error"
    r = await client.post("/api/v1/assistant/answers", json={"question": "x", "jurisdiction_code": "IN", "evil": 1})
    assert r.status_code == 422


async def test_unconfigured_provider_reports_error_event(client, settings_env):
    settings_env(LLM_PROVIDER="nvidia", NVIDIA_API_KEY="", NVIDIA_CHAT_MODEL="")
    r = await client.post("/api/v1/assistant/answers", json={"question": "x", "jurisdiction_code": "IN"})
    assert "event: error" in r.text and "upstream_unavailable" in r.text
