"""Request id, body-size limit, security headers and access logging."""
import time
import uuid

from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.exceptions import PayloadTooLarge
from app.core.logging import get_logger

log = get_logger("access")


class RequestContextMiddleware:
    """Pure ASGI (not BaseHTTPMiddleware) so streaming responses are not buffered."""

    def __init__(self, app: ASGIApp, max_body_bytes: int, upload_paths: tuple[str, ...] = ("/api/v1/documents/upload",),
                 max_upload_bytes: int | None = None) -> None:
        self.app = app
        self.max_body_bytes = max_body_bytes
        self.upload_paths = upload_paths
        self.max_upload_bytes = max_upload_bytes or max_body_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope["headers"])
        request_id = headers.get(b"x-request-id", b"").decode()[:64]
        if not request_id or not request_id.replace("-", "").isalnum():
            request_id = uuid.uuid4().hex
        scope.setdefault("state", {})["request_id"] = request_id

        limit = self.max_upload_bytes if scope["path"] in self.upload_paths else self.max_body_bytes
        declared = headers.get(b"content-length")
        if declared and declared.isdigit() and int(declared) > limit:
            await self._reject(scope, receive, send, request_id)
            return

        received = 0
        too_large = False

        async def limited_receive() -> Message:
            nonlocal received, too_large
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > limit:
                    too_large = True
                    raise PayloadTooLarge(f"Request body exceeds {limit} bytes")
            return message

        status = 500
        start = time.perf_counter()

        async def send_wrapper(message: Message) -> None:
            nonlocal status
            if message["type"] == "http.response.start":
                status = message["status"]
                hdrs = message.setdefault("headers", [])
                hdrs.extend([
                    (b"x-request-id", request_id.encode()),
                    (b"x-content-type-options", b"nosniff"),
                    (b"x-frame-options", b"DENY"),
                    (b"referrer-policy", b"no-referrer"),
                    (b"cache-control", b"no-store"),
                ])
            await send(message)

        try:
            await self.app(scope, limited_receive, send_wrapper)
        except PayloadTooLarge:
            if too_large:
                await self._reject(scope, receive, send_wrapper, request_id)
            else:
                raise
        finally:
            # Path only: no query string, headers or body are ever logged.
            log.info("request", method=scope["method"], path=scope["path"], status=status,
                     duration_ms=round((time.perf_counter() - start) * 1000, 1), request_id=request_id)

    @staticmethod
    async def _reject(scope: Scope, receive: Receive, send: Send, request_id: str) -> None:
        import json
        body = json.dumps({"error": {"code": "payload_too_large", "message": "Request body too large",
                                     "details": None, "request_id": request_id}}).encode()
        await send({"type": "http.response.start", "status": 413,
                    "headers": [(b"content-type", b"application/json"),
                                (b"content-length", str(len(body)).encode()),
                                (b"x-request-id", request_id.encode())]})
        await send({"type": "http.response.body", "body": body})
