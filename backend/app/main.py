from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.errors import register_exception_handlers
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.database import dispose_engine
from app.core.logging import configure_logging, get_logger
from app.middleware.request import RequestContextMiddleware
from app.repositories.documents import DocumentRepository

log = get_logger("app")


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level, settings.log_json)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        removed = DocumentRepository(settings.documents_dir).purge_older_than(settings.upload_retention_days)
        if removed:
            log.info("documents_purged", count=removed)
        yield
        await dispose_engine()

    app = FastAPI(
        title=settings.app_name,
        version=__version__,
        lifespan=lifespan,
        # Interactive docs only outside production.
        docs_url=None if settings.app_env == "production" else "/docs",
        redoc_url=None,
        openapi_url=None if settings.app_env == "production" else "/openapi.json",
    )
    register_exception_handlers(app)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
    )
    # Added last = outermost: request id + size limit wrap everything, including CORS preflights.
    app.add_middleware(RequestContextMiddleware, max_body_bytes=settings.max_request_bytes,
                       max_upload_bytes=settings.max_upload_bytes)
    app.include_router(api_router)
    return app


app = create_app()
