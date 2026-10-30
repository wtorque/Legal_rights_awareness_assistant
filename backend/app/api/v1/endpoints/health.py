from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app import __version__
from app.core.config import Settings, get_settings
from app.core.database import get_session
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(session: AsyncSession = Depends(get_session),
                 settings: Settings = Depends(get_settings)) -> HealthResponse:
    database, pgvector = "ok", "unknown"
    try:
        await session.execute(text("SELECT 1"))
        row = await session.execute(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'"))
        pgvector = "ok" if row.first() else "missing"
    except Exception:
        database = "unavailable"
    return HealthResponse(
        status="ok" if database == "ok" and pgvector == "ok" else "degraded",
        version=__version__, environment=settings.app_env, database=database, pgvector=pgvector,
    )
