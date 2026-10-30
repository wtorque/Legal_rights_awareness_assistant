import asyncio

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings
from app.models import Base

target_metadata = Base.metadata
url = get_settings().database_url


def _configure(connection=None):
    context.configure(connection=connection, url=url, target_metadata=target_metadata,
                      compare_type=True, literal_binds=connection is None,
                      dialect_opts={"paramstyle": "named"})


def run_migrations_offline() -> None:
    _configure()
    with context.begin_transaction():
        context.run_migrations()


def _do_run(connection) -> None:
    _configure(connection)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(url)
    async with engine.connect() as connection:
        await connection.run_sync(_do_run)
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
