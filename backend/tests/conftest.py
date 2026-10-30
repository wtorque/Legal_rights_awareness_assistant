import os

# Must be set before app modules import settings.
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("JWT_SECRET", "test-secret-" + "x" * 32)

import httpx
import pytest

from app.core.config import get_settings
from app.core.database import dispose_engine


@pytest.fixture
def settings_env(monkeypatch):
    """Set env vars, clear the settings cache, and restore on teardown."""
    def _set(**env: str):
        for key, value in env.items():
            monkeypatch.setenv(key, value)
        get_settings.cache_clear()
    yield _set
    get_settings.cache_clear()


@pytest.fixture
async def client(settings_env):
    from app.main import create_app
    app = create_app()
    transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    await dispose_engine()
