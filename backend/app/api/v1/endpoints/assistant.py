import json
import uuid
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.ai.providers.nvidia import NvidiaChatProvider
from app.ai.providers.ollama import OllamaChatProvider
from app.ai.services.assistant import LIMITATIONS, AssistantService, parse_answer
from app.core.config import Settings, get_settings
from app.core.exceptions import AppError, UpstreamUnavailable
from app.core.logging import get_logger
from app.schemas.assistant import Answer, AnswerRequest, NextStep, StructuredAnswer

router = APIRouter(prefix="/assistant", tags=["assistant"])
log = get_logger("assistant")


def get_assistant_service(settings: Settings = Depends(get_settings)) -> AssistantService:
    if settings.llm_provider == "ollama":
        return AssistantService(OllamaChatProvider(settings))
    return AssistantService(NvidiaChatProvider(settings))


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.post("/answers")
async def create_answer(body: AnswerRequest, service: AssistantService = Depends(get_assistant_service)) -> StreamingResponse:
    """Streams `meta`, `delta`..., `final` (authoritative) or `error` as Server-Sent Events."""
    message_id = uuid.uuid4().hex
    jurisdiction = body.jurisdiction_code + (f" ({body.region_code.replace('-', ' ').title()})" if body.region_code else "")

    async def events() -> AsyncIterator[str]:
        yield _sse("meta", {"message_id": message_id, "conversation_id": body.conversation_id})
        try:
            raw = ""
            async for kind, text in service.answer(
                question=body.question,
                history=[{"role": t.role, "content": t.content} for t in body.history],
                language=body.language,
                jurisdiction=jurisdiction,
            ):
                if kind == "delta":
                    yield _sse("delta", {"text": text})
                else:
                    raw = text
            parsed = parse_answer(raw)
            if not parsed.explanation:
                raise UpstreamUnavailable("The AI service returned an empty answer")
            answer = Answer(
                message_id=message_id,
                conversation_id=body.conversation_id,
                status="answered",
                text=parsed.explanation,
                structured=StructuredAnswer(
                    simple_explanation=parsed.explanation,
                    next_steps=[NextStep(**s) for s in parsed.next_steps],
                    limitations=LIMITATIONS,
                    follow_ups=parsed.follow_ups,
                ),
            )
            yield _sse("final", answer.model_dump())
        except AppError as exc:
            yield _sse("error", {"error": {"code": exc.code, "message": exc.message, "details": None, "request_id": None}})
        except Exception as exc:  # stream already started: report in-band, never leak details
            log.error("assistant_stream_failed", error_type=type(exc).__name__)
            yield _sse("error", {"error": {"code": "internal_error", "message": "Something went wrong", "details": None, "request_id": None}})

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
