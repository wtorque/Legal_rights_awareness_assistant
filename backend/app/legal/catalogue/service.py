from functools import lru_cache
from pathlib import Path

from app.core.config import get_settings
from app.core.exceptions import NotFound
from app.legal.catalogue.repository import CatalogueRepository, RightFilter
from app.legal.catalogue.schemas import Right


@lru_cache
def get_repository(root: str | None = None) -> CatalogueRepository:
    base = Path(root or get_settings().catalogue_dir)
    if not base.is_absolute():
        base = Path(__file__).resolve().parents[3] / base  # relative to backend/
    return CatalogueRepository(base)


def require_right(repo: CatalogueRepository, right_id: str) -> Right:
    right = repo.rights.get(right_id)
    if right is None:
        raise NotFound("Right not found")
    return right


__all__ = ["RightFilter", "get_repository", "require_right"]
