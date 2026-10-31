import json
import uuid
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.ai.grounding import asks_for_specifics
from app.ai.guard import classify, refusal_for
from app.ai.language import resolve_language
from app.ai.messages import blocked_text
from app.ai.messages import limitations as limitations_for
from app.ai.messages import removed_note
from app.ai.output_guard import new_canary
from app.ai.pipeline import check_answer
from app.ai.providers.nvidia import NvidiaChatProvider
from app.ai.providers.ollama import OllamaChatProvider
from app.ai.services.assistant import AssistantService, parse_answer
from app.api.deps import current_user
from app.core.config import Settings, get_settings
from app.core.exceptions import AppError, RateLimited, UpstreamUnavailable
from app.core.logging import get_logger
from app.core.ratelimit import SlidingWindow
from app.legal.catalogue.service import get_repository
from app.schemas.assistant import Answer, AnswerRequest, NextStep, StructuredAnswer
from app.schemas.auth import User

router = APIRouter(prefix="/assistant", tags=["assistant"])
log = get_logger("assistant")

# Per user. Refused requests also count as strikes, so probing for a bypass gets a user paused quickly.
_requests = SlidingWindow(20, 60)
_strikes = SlidingWindow(3, 600)


def reset_limits() -> None:
    _requests.clear()
    _strikes.clear()


def get_assistant_service(settings: Settings = Depends(get_settings)) -> AssistantService:
    if settings.llm_provider == "ollama":
        return AssistantService(OllamaChatProvider(settings))
    return AssistantService(NvidiaChatProvider(settings))


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _closed_answer(message_id: str, conversation_id: str | None, status: str, text: str, reason: str, language: str) -> dict:
    return Answer(
        message_id=message_id, conversation_id=conversation_id, status=status, text=text, refusal_reason=reason,
        structured=StructuredAnswer(simple_explanation=text, next_steps=[], limitations=limitations_for(language), follow_ups=[]),
    ).model_dump()


@router.post("/answers")
async def create_answer(
    body: AnswerRequest,
    user: User = Depends(current_user),
    service: AssistantService = Depends(get_assistant_service),
    settings: Settings = Depends(get_settings),
) -> StreamingResponse:
    """Streams `meta`, then (optionally `delta`...) and `final` (authoritative), or `error`, as Server-Sent Events.

    By default no raw model text is streamed: only the checked `final` answer reaches the user.
    """
    _requests.limit, _strikes.limit = settings.assistant_rate_per_minute, settings.assistant_strike_limit
    if _strikes.count(user.id) >= _strikes.limit:
        raise RateLimited("Too many blocked requests. Please wait a few minutes and ask a question about your situation.")
    _requests.hit(user.id)

    message_id = uuid.uuid4().hex
    jurisdiction = body.jurisdiction_code + (f" ({body.region_code.replace('-', ' ').title()})" if body.region_code else "")
    language = resolve_language(body.question, body.language)
    # History comes from the client, so a forged "assistant" turn is as untrusted as a user turn.
    verdict = next((v for v in (classify(t) for t in [body.question, *(h.content for h in body.history)]) if v != "ok"), "ok")
    canary = new_canary()

    async def events() -> AsyncIterator[str]:
        yield _sse("meta", {"message_id": message_id, "conversation_id": body.conversation_id, "language": language})
        if verdict != "ok":
            _strikes.record(user.id)
            log.warning("assistant_input_refused", reason=verdict)
            yield _sse("final", _closed_answer(message_id, body.conversation_id, "refused", refusal_for(verdict, language), verdict, language))
            return
        try:
            raw = ""
            async for kind, text in service.answer(
                question=body.question,
                history=[{"role": t.role, "content": t.content} for t in body.history],
                language=language,
                jurisdiction=jurisdiction,
                canary=canary,
                specifics=asks_for_specifics(body.question),
            ):
                if kind == "full":
                    raw = text
                elif settings.assistant_stream_unverified:
                    yield _sse("delta", {"text": text})
                else:
                    yield ": processing\n\n"  # keeps the connection open without exposing unchecked text
            parsed = parse_answer(raw)
            if not parsed.explanation:
                raise UpstreamUnavailable("The AI service returned an empty answer")
            checked = check_answer(
                parsed, raw, canary=canary, question=body.question,
                history_user_turns=[h.content for h in body.history if h.role == "user"],
                language=language, catalogue=get_repository(),
            )
            if checked.blocked:
                _strikes.record(user.id)
                log.warning("assistant_output_blocked", reason=checked.blocked)
                yield _sse("final", _closed_answer(message_id, body.conversation_id, "refused", blocked_text(language), checked.blocked, language))
                return
            limitations = limitations_for(language)
            if checked.removals:
                limitations.append(removed_note(language, checked.removals))
            yield _sse("final", Answer(
                message_id=message_id,
                conversation_id=body.conversation_id,
                status="answered",
                text=checked.explanation,
                structured=StructuredAnswer(
                    simple_explanation=checked.explanation,
                    next_steps=[NextStep(**s) for s in checked.next_steps],
                    limitations=limitations,
                    follow_ups=checked.follow_ups,
                    provisions=checked.verified,
                    unverified_references=checked.removed_references,
                    removed_details=checked.removals,
                    grounding="partial" if checked.verified else "none",
                ),
            ).model_dump())
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
